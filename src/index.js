/* eslint-env browser */
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import Routing from "./components/Router";
import {Amplify} from "aws-amplify";

//Amplify.configure(awsconfig);

try {
  
  console.log('I am here');
  ReactDOM.render(Routing, document.getElementById("root"));
  serviceWorker.unregister();

} catch (error) {
  // Ignore errors thrown during CloudWatch RUM web client initialization
  console.log('why am I here '+error);
}
