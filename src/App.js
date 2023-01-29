import ProductTable from "./component/product/ProductTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MantineProvider } from "@mantine/core";

const queryClient = new QueryClient();

function App() {
    return (
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <QueryClientProvider client={queryClient}>
                <ProductTable />
            </QueryClientProvider>
        </MantineProvider>
    );
}

export default App;
