import React from "react";
import HeaderData from "./Header";
import { Outlet } from "react-router-dom";
import { Container } from "@mantine/core";

const linkData = [
    { link: "/product", label: "Product" },
    { link: "/order", label: "order" },
];

const Layout = () => {
    return (
        <>
            <HeaderData links={linkData} />
            <Container>
                <Outlet />
            </Container>
        </>
    );
};

export default Layout;
