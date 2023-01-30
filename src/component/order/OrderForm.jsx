import React, { useEffect, useRef, useState } from "react";
import { Button, Checkbox, createStyles, Select, Text, TextInput, Title } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { QueryClient, useMutation, useQuery, useQueryClient } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
const useStyles = createStyles((theme) => ({
    root: {
        position: "relative",
    },

    input: {
        height: "auto",
        paddingTop: 18,
    },

    label: {
        position: "absolute",
        pointerEvents: "none",
        fontSize: theme.fontSizes.xs,
        paddingLeft: theme.spacing.sm,
        paddingTop: theme.spacing.sm / 2,
        zIndex: 1,
    },
}));

const TaxByCate = [
    { cate: "Electronics", tax: 5 },
    { cate: "Cosmetics", tax: 10 },
    { cate: "Clothing", tax: 15 },
    { cate: "Medicines", tax: 18 },
];
const shippingInfo = [
    { type: "Standard", day: 5, price: 5, value: 1 },
    { type: "Two Days", day: 2, price: 10, value: 2 },
    { type: "Next Days", day: 1, price: 15, value: 3 },
];

const orderTotalCal = (productPrice, discount = 0, qty = 1, tax = 0, shippingCharge) => {
    const discountedPrice = productPrice - (productPrice * discount) / 100;

    //tax on main price
    const addTax = discountedPrice + (productPrice * tax) / 100;
    const addQty = addTax * qty;
    return addQty + shippingCharge;
};

export default function OrderForm() {
    const { classes } = useStyles();
    const nav = useNavigate()
    const queryClient = useQueryClient()
    const {state:locationState} = useLocation()
    const [message, setMessage] = useState(null);
    const [dateValue, chageDateValue] = useState(new Date());
    const [dob, changeDob] = useState(new Date());
    const [categories, setCategories] = useState(["Electronics", "Cosmetics", "Clothing", "Medicines"]);
    const [products, setProducts] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [txtMsg, setTextMsg] = useState(0);
    const { isLoading, error, data } = useQuery("productData2", () => fetch("http://localhost:7010/product").then((res) => res.json()));
    const postOrder = async (data) => {
        return axios.post("http://localhost:7010/order",data).then(res => res).catch(res => res)
    }
    const {mutateAsync} = useMutation(postOrder)

    useEffect(() => {
        if (data) {
            const cate = data.map((a) => a.Category);
            setCategories([...new Set(cate)]);
        }
    }, [data]);

    const form = useForm({
        initialValues: {
            category: "",
            product: "",
            productName: "",
            sku: "",
            description: "",
            price: "0",
            discount: "0",
            quantity: "1",

            shippingType: 1,
            date: "02/12/2023",
            
            cName: "",
            cPhone: "",
        },

        validate: {
              category: (value) => (value ? null : 'category is required'),
              sku: (value) => (value ? null : 'sku is required'),
              description: (value) => (value ? null : 'description is required'),
              price: (value) => (value ? null : 'price is required'),
              discount: (value) => (value ? null : 'discount is required'),
              quantity: (value) => (value ? null : 'quantity is required'),

              cName: (value) => (value ? null : 'Customer Name is required'),
              cPhone: (value) => (value ? null : 'Customer Phone is required'),
        },
    });
    const handleSubmit = async (data) => {
        console.log(data);
        // return;
        const ship = shippingInfo.find(a => a.value === data.shippingType)
        
        const arg = {
            product : {
                name: data.productName,                
                sku: data.sku,
                description: data.description,
                category: data.category,
                quantity: parseInt(data.quantity),
                price:data.price,
                discount:data.discount,
                tax:txtMsg,
                netPrice:data.price - (data.price * data.discount) / 100,
            },
            shipping: {
                type: ship.type,
                charge: ship.price,
                estimatedDate: dateValue.toISOString().split('T')[0],
            },
            customer : {
                name: data.cName,
                DOB: dob.toISOString().split('T')[0],
                phone: data.cPhone,
            },
            signatureRequired:!!data.signatureRequired,
            receiveStausUpdate:!!data.receiveStausUpdate,
            termsAgree:!!data.termsAgree,
        }

        try {
            const res = await mutateAsync(arg)
            console.log(res);
            if(res.status === 201){
                queryClient.invalidateQueries('orderData')
                nav('/order-list')
            }else {
                setMessage(JSON.stringify(res.response.data.errors))
                // console.log(res.response.data.errors);
            }
        } catch (error) {
            console.log(error);
        }

    }

    useEffect(() => {
        if (data && form.values.category) {
            const filteredProduct = data.filter((c) => c.Category === form.values.category);
            const prod = filteredProduct.map((a) => ({ label: a["Product Name"], value: a["SKU"] }));
            setProducts([...new Set(prod)]);
            const ifTxt = TaxByCate.find((c) => c.cate === form.values.category);
            setTextMsg(ifTxt.tax ?? 0);
            form.setFieldValue("product", null);
        }
    }, [form.values.category]);

    useEffect(() => {
        let filteredSingleProduct = {};
        if (data && form.values.product) {
            filteredSingleProduct = data.find((c) => c.SKU === form.values.product);
        }
        form.setFieldValue("productName", filteredSingleProduct["Product Name"] ?? "");
        form.setFieldValue("sku", filteredSingleProduct.SKU ?? "");
        form.setFieldValue("description", filteredSingleProduct.Description ?? "");
        form.setFieldValue("price", filteredSingleProduct.Price ?? 0);
        form.setFieldValue("discount", filteredSingleProduct.Discount ?? 0);
    }, [form.values.product]);

    useEffect(() => {
        let result = new Date();
        if (form.values.shippingType) {
            const increment = shippingInfo.find((a) => a.value === form.values.shippingType);
            result.setDate(result.getDate() + increment.day);
            chageDateValue(result);
        }
    }, [form.values.shippingType]);

    useEffect(() => {
        if(locationState?.cate && locationState.product){
            form.setFieldValue("category",locationState.cate)
            setTimeout(() => {
                form.setFieldValue("product",locationState.product)
            }, 100);
        }
    }, [locationState]);

    // console.log(form.values);
    useEffect(() => {
        setTotalAmount(
            orderTotalCal(
                form.values.price,
                form.values.discount,
                form.values.quantity,
                txtMsg,
                shippingInfo.find((a) => a.value === form.values.shippingType).price
            ))
    }, [form.values.price,
        form.values.discount,
        form.values.quantity,txtMsg,form.values.shippingType]);

    return (
        <div>
            <Title>Create Order</Title>
            {!!message && <Text fz='md' c="red" style={{ marginBottom: 20 }}>
                    {message}
                </Text>}
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Text fz='md' style={{ marginTop: 20 }}>
                    Product Info
                </Text>
                <Select
                    style={{ marginTop: 20, zIndex: 3 }}
                    data={categories}
                    placeholder='Category'
                    label='category'
                    classNames={classes}
                    {...form.getInputProps("category", { type: "select" })}
                />
                <Select
                    style={{ marginTop: 20, zIndex: 2 }}
                    data={products}
                    placeholder='select product'
                    label='product'
                    classNames={classes}
                    {...form.getInputProps("product", { type: "select" })}
                />

                <TextInput style={{ marginTop: 20 }} disabled label='SKU' placeholder='sku' classNames={classes} {...form.getInputProps("sku")} />
                <TextInput
                    style={{ marginTop: 20 }}
                    label='Description'
                    disabled
                    placeholder='Description'
                    classNames={classes}
                    {...form.getInputProps("description")}
                />
                <TextInput
                    disabled
                    style={{ marginTop: 20 }}
                    label='Price in $'
                    placeholder='0'
                    classNames={classes}
                    {...form.getInputProps("price")}
                />
                <TextInput
                    disabled
                    style={{ marginTop: 20 }}
                    label='Discount in %'
                    placeholder='0'
                    classNames={classes}
                    {...form.getInputProps("discount")}
                />
                <Text fz='sm' c='blue' style={{ marginTop: 10 }}>
                    Tax is based on selected category, which is :{txtMsg}%
                </Text>
                <Select
                    style={{ marginTop: 20, zIndex: 3 }}
                    data={["1", "2", "3", "4", "5"]}
                    placeholder='Quantity'
                    label='quantity'
                    classNames={classes}
                    {...form.getInputProps("quantity", { type: "select" })}
                />
                <Text fz='md' style={{ marginTop: 20 }}>
                    Shipping Info
                </Text>
                <Select
                    style={{ marginTop: 20, zIndex: 2 }}
                    data={shippingInfo.map((a) => ({ label: `${a.type} - $${a.price}`, value: a.value }))}
                    placeholder='Shipping Type'
                    label='Shipping Type'
                    classNames={classes}
                    {...form.getInputProps("shippingType", { type: "select" })}
                />
                {/* shipping charge |  total amount charged | estimated delivery */}
                <DatePicker
                    style={{ marginTop: 20 }}
                    label='shipping Date'
                    placeholder='When will you leave?'
                    classNames={classes}
                    readOnly
                    clearable={false}
                    value={dateValue}
                    onChange={chageDateValue}
                />
                <Text fz='sm' c="teal.4" style={{ marginTop: 10 }}>
                    your total amount will be ${totalAmount} including all charges
                </Text>
                <Checkbox
                    style={{ marginTop: 20 }}
                    {...form.getInputProps("receiveStausUpdate", { type: "checkbox" })}
                    label='Receive Status Updates'
                />
                <Checkbox
                    style={{ marginTop: 20 }}
                    {...form.getInputProps("signatureRequired", { type: "checkbox" })}
                    label='Delivery Signature Required?'
                />

                <Text fz='md' style={{ marginTop: 20 }}>
                    Customer Info
                </Text>
                <TextInput
                    style={{ marginTop: 20 }}
                    label='Customer Name'
                    placeholder='customer name'
                    classNames={classes}
                    {...form.getInputProps("cName")}
                />
                <TextInput
                    style={{ marginTop: 20 }}
                    label='Customer Phone'
                    placeholder='customer phone'
                    classNames={classes}
                    {...form.getInputProps("cPhone")}
                />
                <DatePicker
                    style={{ marginTop: 20 }}
                    label='Customer DOB'
                    placeholder='DOB'
                    classNames={classes}
                    clearable={false}
                    value={dob}
                    onChange={changeDob}
                />

                <Button style={{ marginTop: 20 }} variant='outline' type='submit'>
                    Add Order
                </Button>
            </form>
        </div>
    );
}
