import ProductTable from "./component/product/ProductTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MantineProvider } from "@mantine/core";
import Layout from "./component/layout/Layout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NoPage from "./component/NoPage";
import OrderTable from "./component/order/OrderTable";
import OrderForm from "./component/order/OrderForm";

const queryClient = new QueryClient();

function App() {
    return (
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<Layout />}>
                            <Route index element={<ProductTable />} />
                            <Route path='product' element={<ProductTable />} />
                            <Route path='order' element={<OrderForm />} />
                            <Route path='*' element={<NoPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </QueryClientProvider>
        </MantineProvider>
    );
}

export default App;
