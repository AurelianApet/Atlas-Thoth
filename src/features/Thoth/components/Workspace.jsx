import { useEffect } from "react";

import { debounce } from "../../../utils/debounce";

import WorkspaceProvider from "../../../contexts/WorkspaceProvider";
import { Editor } from "../../../contexts/ReteProvider";
import { Layout } from "../../../contexts/LayoutProvider";
import { useSpell } from "../../../contexts/SpellProvider";
import { useRete } from "../../../contexts/ReteProvider";

import EventHandler from "./EventHandler";
import StateManager from "./StateManagerWindow";
import Playtest from "./PlaytestWindow";
import Inspector from "./InspectorWindow";
import EditorWindow from "./EditorWindow";
import TextEditor from "./TextEditorWindow";

const Workspace = ({ tab, appPubSub }) => {
  const { saveSpell, loadSpell } = useSpell();
  const { editor } = useRete();

  // Set up autosave for the workspace
  useEffect(() => {
    if (!editor?.on) return;
    editor.on(
      "nodecreated noderemoved connectioncreated connectionremoved nodetranslated",
      debounce(() => {
        saveSpell(tab.spell, { graph: editor.toJSON() }, false);
      }, 300)
    );
  }, [editor]);

  useEffect(() => {
    if (!tab) return;
    loadSpell(tab.spell);
  }, [tab]);

  const factory = (tab) => {
    return (node) => {
      const component = node.getComponent();
      switch (component) {
        case "editor":
          return <Editor />;
        case "stateManager":
          return <StateManager node={node} />;
        case "playtest":
          return <Playtest />;
        case "inspector":
          return <Inspector node={node} />;
        case "textEditor":
          return <TextEditor node={node} />;
        case "editorWindow":
          return <EditorWindow tab={tab} />;
        default:
          return <p></p>;
      }
    };
  };

  return (
    <div style={{ visibility: !tab.active ? "hidden" : null, height: "100%" }}>
      <EventHandler tab={tab} pubSub={appPubSub} />
      <Layout json={tab.layoutJson} factory={factory(tab)} tab={tab} />
    </div>
  );
};

const Wrapped = (props) => {
  return (
    <WorkspaceProvider {...props}>
      <Workspace {...props} />
    </WorkspaceProvider>
  );
};

export default Wrapped;