import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button, Table } from "@mantine/core";
import { ActionIcon } from "@mantine/core";
import axios from "axios";
import { Modal } from '@mantine/core';


export default function OrderTable() {
    const queryClient = useQueryClient()
    const [opened, setOpened] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const { isLoading, error, data } = useQuery("orderData", () => fetch("http://localhost:7010/order").then((res) => res.json()));

    const deleteInDb = async (data) => {
        return axios.delete("http://localhost:7010/order/"+data).then(res => res).catch(res => res)
    }
    const {mutateAsync} = useMutation(deleteInDb)
    const deleteOrder = async(ev) => {
        await mutateAsync(orderId)
        setOrderId(null)
        setOpened(false)
        queryClient.invalidateQueries('orderData')
    };

    console.log(data);

    if (isLoading) return "Loading...";
    const rows =
        !!data?.data.length &&
        data?.data.map((element, i) => (
            <tr key={i}>
                <td>{element.orderId}</td>
                <td>{`${element.products.sku} - ${element.products.name}`}</td>
                <td>{element.products.quantity}</td>
                <td>{element.shipping.type}</td>
                <td>{element.totalAmount}</td>
                <td>{element.customer.name}</td>
                <td>{new Date(element.customer.DOB).toISOString().split('T')[0]}</td>
                <td>{element.customer.phone ?? "-"}</td>
                <td>
                    {" "}
                    <ActionIcon onClick={() => setOpened(true) & setOrderId(element.orderId)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zm3.17-7.83c.39-.39 1.02-.39 1.41 0L12 12.59l1.42-1.42c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41L13.41 14l1.42 1.42c.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0L12 15.41l-1.42 1.42c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41L10.59 14l-1.42-1.42c-.39-.38-.39-1.02 0-1.41zM15.5 4l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1h-2.5z"/></svg>
                    </ActionIcon>
                </td>
            </tr>
        ));

    if (error) return "An error has occurred: " + error.message;
    
    return (
    <>
        <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        centered
        title="Are You sure you want to delete?"
      >
        {/* Modal content */}
        <div style={{display:"flex",justifyContent:"center"}}>
        <Button onClick={() => deleteOrder()} style={{marginRight:5}}>Yes</Button>
        <Button onClick={() => setOpened(false)}>No</Button>

        </div>
      </Modal>
        <Table>
            <thead>
                <tr>
                    <th>Order Id</th>
                    <th>SKU - Product Name</th>
                    <th>Quantity</th>

                    <th>Shipping Type</th>
                    <th>Total Amount</th>
                    <th>Customer Name</th>
                    <th>Customer DOB</th>
                    <th>Customer Phone</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </Table>
    </>        
    );
}
