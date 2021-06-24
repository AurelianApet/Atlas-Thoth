import Rete from "rete";
import { TextInputControl } from "../controls/TextInputControl";
import { dataSocket } from "../sockets";

export class Alert extends Rete.Component {
  constructor() {
    // Name of the component
    super("Alert");

    this.task = {
      outputs: {},
    };
  }
  // the builder is used to "assemble" the node component.
  // when we have enki hooked up and have garbbed all few shots, we would use the builder
  // to generate the appropriate inputs and ouputs for the fewshot at build time
  builder(node) {
    // create inputs here. First argument is th ename, second is the type (matched to other components sockets), and third is the socket the i/o will use
    const dataInput = new Rete.Input("data", "Data", dataSocket);

    const input = new TextInputControl({
      emitter: this.editor,
      key: "text",
      value: "Input text",
    });

    return node.addInput(dataInput).addControl(input);
  }

  // the worker contains the main business logic of the node.  It will pass those results
  // to the outputs to be consumed by any connecte components
  async worker(node, inputs, data) {
    alert(node.data.text);
  }
}
