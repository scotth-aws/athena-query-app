import React, { useState, useEffect } from "react";
import "./index.css";

import {
  Logger,
  Auth,
  API,
  graphqlOperation,
} from "aws-amplify";
//import { search } from "../../graphql/queries.js";
//import { onSearchResult } from "../../graphql/subscriptions";
//import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import {
  AppLayout,
  Box,
  Header,
  HelpPanel,
  Button,
  Form,
  Container,
  FormField,
  TextContent,
  Select,
  Link,
  SpaceBetween,
  Modal,
} from "@cloudscape-design/components";
//import { appLayoutLabels, itemSelectionLabels } from "../labels";
import Navigation from "../Navigation";
import { useNavigate } from "react-router-dom";

const logger = new Logger("erdLogger", "DEBUG");

const Content = (user) => {
  //console.log("Content username " + JSON.stringify(user));

  var token = user.username.token;
  var cuser = user.username.username;
  const navigate = useNavigate();
  const [disabled, setDisabled] = useState(false);
  const [linkDisabled, setLinkDisabled] = useState(true);
  const [alert, setAlert] = useState("");
  const [alertColor, setAlertColor] = React.useState("blue");
  const [headerColor, setHeaderColor] = React.useState("#000066");
  const [outputs, setOutputs] = useState("");
  var [alertDismissible, setAlertDismissible] = useState(false);
  var [alertSuccess, setAlertSuccess] = useState("success");

  var [deploymentHeader, setDeploymentHeader] = useState(
    "Deployment In Progress, this may take 10 minutes"
  );
  const [visible, setVisible] = React.useState(false);
  const [selectValue, setSelectValue] = useState({
    label: "Variant Report 1",
    value: "1",
  });
  var [modalStatus, setModalStatus] = useState("MODAL_IN_PROGRESS");

  const modalExit = () => {
    if (modalStatus === "MODAL_IN_PROGRESS") {
    } else {
      setVisible(false);
      navigate("/");
    }
  };
  const submitFormHandler = (event, selectValue) => {
    setDisabled(true);
    setAlertSuccess("success");
    setAlert("Deployment Status: \"IN_PROGRESS\"");
    setVisible(true);

    const searchObject = {
      StackName: "research-ec2-" + cuser,
      Parameters:
        "[{'ParameterKey': 'InstanceType','ParameterValue': '" +
        selectValue.label +
        "'}]",
      DisableRollback: "False",
      TimeoutInMinutes: "30",
      Capabilities: "['CAPABILITY_IAM','CAPABILITY_NAMED_IAM']",
      NotificationARNs: "[]",
      Tags: "[{'Key': 'name', 'Value' : 'EC2 Instance'}]",
      BucketKey: "ec2_instance.json",
      BucketName: "",
      wait_time: 5,
      token: token,
    };

    
     
  };
  return (
    <div id="top" className="ec2App">
      <SpaceBetween direction="vertical" size="l">
        <Container variant="stacked"
          header={
            <Header variant="h3">
              <strong style={{ color: headerColor }}>
                Create an Variant report that . . . 
              </strong>
            </Header>
          }
        ></Container>

        <Form
          actions={
            <Container>
              <Button onClick={(event) => navigate("/")} variant="link">
                Home
              </Button>
              <Button
                variant="primary"
                disabled={disabled}
                onClick={(event) => submitFormHandler(event, selectValue)}
              >
                Submit
              </Button>
            </Container>
          }
        >
          <Container
            header={<Header variant="h3">Report Configuration</Header>}
          >
            <SpaceBetween direction="vertical" size="s">
              <FormField
                label="Select Report and hit Submit"
                errorText={!selectValue && "Select an Instance Type"}
              >
                <TextContent></TextContent>

                <Select
                  options={[
                    {
                      label: "Variant Report 1",
                      value: "1",
                    },
                    {
                      label: "Variant Report 2",
                      value: "2",
                    },
                    {
                      label: "Variant Report 4",
                      value: "3",
                    }
                   
                  ]}
                  selectedOption={selectValue}
                  onChange={(event) =>
                    setSelectValue(event.detail.selectedOption)
                  }
                  selectedAriaLabel="selected"
                />
              </FormField>
            </SpaceBetween>

            <SpaceBetween direction="vertical" size="s">
              <Link
                external
                variant="primary"
                externalIconAriaLabel=""
                href="https://aws.amazon.com/ec2/instance-types/?trk=36c6da98-7b20-48fa-8225-4784bced9843&sc_channel=ps&s_kwcid=AL!4422!3!536392622533!e!!g!!aws%20ec2%20instance%20types&ef_id=Cj0KCQiAgribBhDkARIsAASA5bu5uxV1xqYwmJtgcilwIcQJAvFFWNE1EypSklKYbdL4fxYPgudghK0aAkA8EALw_wcB:G:s&s_kwcid=AL!4422!3!536392622533!e!!g!!aws%20ec2%20instance%20types"
                disabled={linkDisabled}
              >
                Learn more about these Reports
              </Link>
            </SpaceBetween>
            <Box>
              <Modal
                onDismiss={() => modalExit()}
                visible={visible}
                closeAriaLabel="Close modal"
                footer={
                  <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs"></SpaceBetween>
                  </Box>
                }
                header={deploymentHeader}
              >
                <TextContent>
                  <strong style={{ color: alertColor }}>{alert}</strong>
                </TextContent>
                <TextContent></TextContent>
              </Modal>
            </Box>
          </Container>

        </Form>
      </SpaceBetween>
    </div>
  );
};

const SideHelp = () => (

  <HelpPanel header={<h2>Variant Report Help</h2>}>
    <SpaceBetween size="m">
      <Box>
        <strong>This is where help around the report generation will be .. </strong>
        
      </Box>
     
    </SpaceBetween>
    
  </HelpPanel>
);

function EC2() {
  const [User, setUser] = useState({});
  useEffect(() => {
    let current_user = {};
    try {
      current_user = {
        isLoggedIn: false,
        isOperator: true,
        isAdmin: false,
        username: "",
        token: "",
      };
      
    } catch (e) {
      console.log("setUser Error");
      setUser(current_user);
      logger.error(
        "Admin -> index.jsx - useEffect error " + JSON.stringify(e),
        Date.now()
      );
    } finally {
      console.log("finally ");
    }
  }, []);
  //console.log("User " + JSON.stringify(User));
  const [lnavopen, setLnavopen] = useState(false);
  const [rnavopen, setRnavopen] = useState(false);
  const navChange = (detail) => {
    setLnavopen(detail.open);
  };
  const toolsChange = (detail) => {
    setRnavopen(detail.open);
  };
  return (
    <AppLayout
      disableContentPaddings={false}
      navigation={<Navigation User={User} />}
      content={<Content username={User} />}
      contentType="default"
      toolsOpen={rnavopen}
      //toolsWidth={350}
      tools={<SideHelp />}
      navigationOpen={lnavopen}
      onNavigationChange={({ detail }) => navChange(detail)}
      onToolsChange={({ detail }) => toolsChange(detail)}
    />
  );
}


export default EC2;
