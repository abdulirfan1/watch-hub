import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import BrandsPage from "./pages/BrandsPage";
import BrandPage from "./pages/BrandPage";
import ModelPage from "./pages/ModelPage";
import WatchDetailPage from "./pages/WatchDetailPage";
import { NotFound } from "./components/NotFound";

export default function App() {
  return (
    <BrowserRouter basename="/watch-hub">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path=":brandSlug" element={<BrandPage />} />
          <Route path=":brandSlug/:modelSlug" element={<ModelPage />} />
          <Route path=":brandSlug/:modelSlug/:ref" element={<WatchDetailPage />} />
          <Route path=":brandSlug/:modelSlug/:ref/:variantSlug" element={<WatchDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
