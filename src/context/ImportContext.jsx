import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useWorkspace } from "./WorkspaceContext.jsx";
import {
  fetchShopifyProductsApi,
  getSavedImportedProducts,
  getSavedImportStats,
  importSelectedProductsApi,
} from "../api/shopifyImportService.js";

const ImportContext = createContext(null);

export function ImportProvider({ children }) {
  const { accessToken } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?._id || "ws_demo_active";

  const [catalogProducts, setCatalogProducts] = useState([]);
  const [importedProducts, setImportedProducts] = useState([]);
  const [lastImportStats, setLastImportStats] = useState(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);

  // Sync saved imported catalog whenever active workspace changes
  useEffect(() => {
    setImportedProducts(getSavedImportedProducts(workspaceId));
    setLastImportStats(getSavedImportStats(workspaceId));
    setCatalogProducts([]);
    setImportError(null);
  }, [workspaceId]);

  // 1. Fetch lightweight product table from Shopify
  const loadShopifyCatalog = useCallback(
    async (limit = 50) => {
      setLoadingCatalog(true);
      setImportError(null);
      try {
        const products = await fetchShopifyProductsApi(
          { workspaceId, limit },
          accessToken
        );
        setCatalogProducts(products);
        return products;
      } catch (err) {
        setImportError(
          err.message || "Could not load products from Shopify. Please try again."
        );
        return [];
      } finally {
        setLoadingCatalog(false);
      }
    },
    [workspaceId, accessToken]
  );

  // 2. Import selected products (REST deep fetch + MongoDB Product & ImportLog save)
  const runProductImport = useCallback(
    async (selectedProducts) => {
      if (!selectedProducts || selectedProducts.length === 0) return null;

      setImporting(true);
      setImportError(null);
      try {
        const res = await importSelectedProductsApi(
          { workspaceId, selectedProducts },
          accessToken
        );
        setLastImportStats(res.stats);
        setImportedProducts(res.importedProducts);
        return res.stats;
      } catch (err) {
        setImportError(
          err.message || "The import failed. No products were changed."
        );
        throw err;
      } finally {
        setImporting(false);
      }
    },
    [workspaceId, accessToken]
  );

  return (
    <ImportContext.Provider
      value={{
        catalogProducts,
        importedProducts,
        lastImportStats,
        loadingCatalog,
        importing,
        importError,
        loadShopifyCatalog,
        runProductImport,
      }}
    >
      {children}
    </ImportContext.Provider>
  );
}

export function useImport() {
  const ctx = useContext(ImportContext);
  if (!ctx) {
    throw new Error("useImport must be used inside ImportProvider");
  }
  return ctx;
}