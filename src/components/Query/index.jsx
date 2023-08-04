import React, { useState, useEffect } from "react";
import "./index.css";

import {
  Logger,
  Auth,
  API,
  graphqlOperation,
} from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { createReport } from "../../graphql/mutations";
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
import { Amplify } from "aws-amplify";
import awsconfig from "../../aws-exports";
const logger = new Logger("erdLogger", "DEBUG");

Amplify.configure(awsconfig);

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
    "Report Generation In Progress, this may take a few minutes"
  );
  const [visible, setVisible] = React.useState(false);
  const [selectValue, setSelectValue] = useState({
    label: "List of all variant genes and coordinates",
    value: "1",
  });
  var [modalStatus, setModalStatus] = useState("MODAL_IN_PROGRESS");

  const modalExit = () => {

    setVisible(false);
    navigate("/");

  };
  const submitFormHandler = (event, selectValue) => {
    console.log('selectValue ' + JSON.stringify(selectValue));
    setDisabled(true);
    setAlertSuccess("success");
    setAlert("Report Generation: \"IN_PROGRESS\"");
    setVisible(true);
    var description = "";
    var name = ""
    if (selectValue.value === '1') {
      description = 'A report on all variants';
      name = "List of all variant genes and coordinates";
    } else if (selectValue.value === '2') {
      description = 'A report on all variants where CADD score >=2';
      name = "List of all variant genes and coordinates where CADD score >=20";
    } else {
      description = 'A report on all variants where ClinVar annotations are likely_pathogenic or pathogenic';
      name = "List of all variant genes and coordinates where ClinVar annotations are likely_pathogenic or pathogenic";
    }
    try {
      var qinput = { input: { name: name, description: description, query: "SELECT * from \"uf_genomics_reporting\".\"uf_variants\" limit 10", createdAt: 1691074526 } }
      API.graphql(graphqlOperation(createReport, qinput)).then((response, error) => {

        console.log('createReport ' + JSON.stringify(response.data));
        navigate("/");



      })
    } catch (e) {

      console.log(JSON.stringify(e));
    } finally {

      console.log("finally");

    }


  };
  return (
    <div id="top" className="ec2App">
      <SpaceBetween direction="vertical" size="l">
        <Container variant="stacked"
          header={
            <Header variant="h3">
              <strong style={{ color: headerColor }}>
                Generate Genomics Reports
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
                      label: "List of all variant genes and coordinates",
                      value: "1",
                    },
                    {
                      label: "List of all variant genes and coordinates where CADD score >=20",
                      value: "2",
                    },
                    {
                      label: "List of all variant genes and coordinates where ClinVar annotations are likely_pathogenic or pathogenic",
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
                href="https://neurology.ufl.edu/divisions/lnn/"
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
        <strong>This is where help around the report generation will be</strong>

      </Box>

    </SpaceBetween>

  </HelpPanel>
);

function Query() {
  const [User, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
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
      // get the current authenticated user object
      Auth.currentAuthenticatedUser({
        bypassCache: false, // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
      })
        .then((user) => {
          setIsLoading(false);

        })
        .catch(
          (err) => {
            setIsLoading(false);
            if (process.env.NODE_ENV === 'development')
              console.log("Home -> index.jsx - Auth error " + JSON.stringify(err), Date.now())

          });

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
  if (!isLoading) {
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
  } else {
    return (
      <Container>
        <TextContent>Loading . . . </TextContent>
      </Container>
    );
  }
}


export default withAuthenticator(Query);;
