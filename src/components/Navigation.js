import { SideNavigation, SpaceBetween, Badge, Container, ButtonDropdown, Box } from "@cloudscape-design/components";
import React, { useEffect, useState } from "react";



const Navigation = (current_user) => {
    console.log('Navigation called');
    const User = 'hesct';
    const [researchName, setResearchName] = React.useState("General Reporting");
    const [badgeColor, setBadgeColor] = React.useState("blue");
    const [NavigationItems, setNavigationItems] = useState([]);
    const setResearchEnv = (event) => {
        if (event.detail.id === 'General Reporting') {
            setResearchName('General Reporting');
            setBadgeColor("blue");
        } else {
            setResearchName('Detailed Reporting');
            setBadgeColor("green");
        }
        setNavBar(event.detail.id);

    }
    const setNavBar = (id) => {
        //console.log(' setNavBar event ' + id);
        let navigation_items = [];






        navigation_items.push({
            type: "section",
            text: "Home",
            expanded: true,
            items: [
                { type: "link", text: "Generated Reports", href: "/Home" }

            ]
        });


        navigation_items.push({
            type: "section",
            text: "Variant Reporting",
            expanded: true,
            items: [

                { type: "link", text: "Top 3 Variant Reports", href: "/Query" },
                { type: "link", text: "Filtered Variant Reports by Chromosome and ClinVar", href: "QueryFilterGeneClinVar" },
                { type: "link", text: "Filtered Variant Reports by Gene Name", href: "QueryFilterGeneName" },
                { type: "link", text: "Filtered Variant Reports by Variant Name", href: "QueryFilterVariantName" },
                { type: "link", text: "Filtered Variant Reports by Variant Frequency", href: "QueryFilterVariantFrequency" }

            ]
        });
       




        setNavigationItems(navigation_items);



    }

    useEffect(() => {
        setNavBar('General Reporting');
    }, [User]);

    return (

        <SpaceBetween direction="vertical" size="l">
            <Container>
                <ButtonDropdown onItemClick={(event) => setResearchEnv(event)}
                    items={[
                        { text: "General Reporting", id: "General Reporting", disabled: false },
                        { text: "Detailed Reporting", id: "Detailed Reporting", disabled: false }

                    ]}
                >
                    Select Reporting Path
                </ButtonDropdown>


                <Box textAlign="center" color="inherit">
                    <Badge color={badgeColor}>{researchName}</Badge>
                </Box>

            </Container>

            <SideNavigation activeHref={0} items={NavigationItems} />
        </SpaceBetween>
    );
};

export default Navigation;
