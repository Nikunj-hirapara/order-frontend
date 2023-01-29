import React from "react";
import { useQuery } from "react-query";
import { Table } from "@mantine/core";
import { ActionIcon } from "@mantine/core";

export default function OrderTable() {
    const { isLoading, error, data } = useQuery("productData", () => fetch("http://localhost:7010/product").then((res) => res.json()));

    const addOrder = (ev) => {
      console.log(ev.SKU);
    }

    if (isLoading) return "Loading...";
    const rows =
        !!data.length &&
        data.map((element, i) => (
            <tr key={i}>
                <td>{element["Product Name"]}</td>
                <td>{element.SKU}</td>
                <td>{element.Description}</td>
                <td>{element.Price}</td>
                <td>{element.Discount}</td>
                <td>
                    {" "}
                    <ActionIcon onClick={()=>addOrder(element)}>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            class='icon icon-tabler icon-tabler-shopping-cart'
                            width='44'
                            height='44'
                            viewBox='0 0 24 24'
                            stroke-width='1.5'
                            stroke='#2c3e50'
                            fill='none'
                            stroke-linecap='round'
                            stroke-linejoin='round'>
                            <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                            <circle cx='6' cy='19' r='2' />
                            <circle cx='17' cy='19' r='2' />
                            <path d='M17 17h-11v-14h-2' />
                            <path d='M6 5l14 1l-1 7h-13' />
                        </svg>
                    </ActionIcon>
                </td>
            </tr>
        ));

    if (error) return "An error has occurred: " + error.message;
    console.log(data);
    return (
        <Table>
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </Table>
    );
}
