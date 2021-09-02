import { useRef } from "react";
import init from "../features/rete/editor";
import gridimg from "../grid.png";

import { useRete } from "./ReteProvider";
import { usePubSub } from "./PubSubProvider";
import { useSpell } from "./SpellProvider";

import { useContext, createContext, useState } from "react";
import LoadingScreen from "../features/common/LoadingScreen/LoadingScreen";

const Context = createContext({
  run: () => {},
  getEditor: () => {},
  editor: {},
  serialize: () => {},
  buildEditor: () => {},
  setEditor: () => {},
  getNodeMap: () => {},
  getNodes: () => {},
  loadGraph: () => {},
  setContainer: () => {},
  undo: () => {},
  redo: () => {},
});

export const useEditor = () => useContext(Context);

const EditorProvider = ({ children }) => {
  const [editor, setEditorState] = useState();
  const editorRef = useRef(null);
  const pubSub = usePubSub();

  const setEditor = (editor) => {
    editorRef.current = editor;
    setEditorState(editor);
  };

  const getEditor = () => {
    return editorRef.current;
  };

  const buildEditor = async (container, spell, tab, thoth) => {
    const newEditor = await init({
      container,
      pubSub,
      // calling thothV2 during migration of features
      thothV2: thoth,
      thoth: spell,
      tab,
    });

    // set editor to the map
    setEditor(newEditor);

    if (tab.type === "spell") {
      const spellDoc = await thoth.getSpell(tab.spell);
      newEditor.loadGraph(spellDoc.toJSON().graph);
    }

    if (tab.type === "module") {
      const moduleDoc = await thoth.getModule(tab.module);
      newEditor.loadGraph(moduleDoc.toJSON().data);
    }
  };

  const run = () => {
    console.log("RUN");
  };

  const undo = () => {
    editorRef.current.trigger("undo");
  };

  const redo = () => {
    editorRef.current.trigger("redo");
  };

  const serialize = () => {
    return editorRef.current.toJSON();
  };

  const getNodeMap = () => {
    return editor && editor.components;
  };

  const getNodes = () => {
    return editor && Object.fromEntries(editor.components);
  };

  const loadGraph = (graph) => {
    editor.loadGraph(graph);
  };

  const publicInterface = {
    run,
    serialize,
    editor,
    editorRef,
    buildEditor,
    getNodeMap,
    getNodes,
    loadGraph,
    setEditor,
    getEditor,
    undo,
    redo,
  };

  return (
    <Context.Provider value={publicInterface}>{children}</Context.Provider>
  );
};

export const Editor = ({ tab, children }) => {
  const [loaded, setLoaded] = useState(null);
  const { buildEditor } = useEditor();
  const spell = useSpell();
  // This will be the main interface between thoth and rete
  const reteInterface = useRete();

  if (!tab) return <LoadingScreen />;

  return (
    <>
      <div
        style={{
          textAlign: "left",
          width: "100vw",
          height: "100vh",
          position: "absolute",
          backgroundColor: "#191919",
          backgroundImage: `url('${gridimg}')`,
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {}}
      >
        <div
          ref={(el) => {
            if (el && !loaded) {
              buildEditor(el, spell, tab, reteInterface);
              setLoaded(true);
            }
          }}
        />
      </div>
      {children}
    </>
  );
};

export default EditorProvider;