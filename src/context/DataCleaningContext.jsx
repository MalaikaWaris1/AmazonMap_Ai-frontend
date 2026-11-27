import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import { useWorkspace } from "./WorkspaceContext.jsx";
import {
  compareProductDetailApi,
  executeDataCleaningPipelineApi,
  fetchInspectedProductsListApi,
  getHealthAuditMetricsApi,
  saveSingleCleanedProductApi,
} from "../api/dataCleaningService.js";

const DataCleaningContext = createContext(null);

const EMPTY_METRICS = {
  totalProducts: 0,
  missingValuesCount: 0,
  missingValuesPercent: 0,
  formattingNormalizedCount: 0,
  formattingNormalizedPercent: 0,
  skusReconciledCount: 0,
  skusReconciledPercent: 0,
};

export function DataCleaningProvider({ children }) {
  const auth = useAuth();
  const token = auth?.accessToken || auth?.token || null;

  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?._id || "ws_demo_active";

  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [comparison, setComparison] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const [error, setError] = useState(null);
  const [compareError, setCompareError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setMetrics(EMPTY_METRICS);
    setProducts([]);
    setSelectedProductId(null);
    setComparison(null);
    setError(null);
    setCompareError(null);
    setFeedback(null);
  }, [workspaceId]);

  const loadMetrics = useCallback(async () => {
    if (!workspaceId) return EMPTY_METRICS;
    try {
      const data = await getHealthAuditMetricsApi({ workspaceId }, token);
      setMetrics(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch health audit metrics.");
      return EMPTY_METRICS;
    }
  }, [workspaceId, token]);

  const loadComparison = useCallback(
    async (productId) => {
      if (!productId) {
        setComparison(null);
        return null;
      }
      setSelectedProductId(productId);
      setLoadingCompare(true);
      setCompareError(null);
      try {
        const detail = await compareProductDetailApi(
          { productId, workspaceId },
          token
        );
        setComparison(detail);
        return detail;
      } catch (err) {
        setCompareError(
          err.message || "Inventory element mapping record not identified."
        );
        setComparison(null);
        return null;
      } finally {
        setLoadingCompare(false);
      }
    },
    [workspaceId, token]
  );

  const loadProducts = useCallback(
    async ({ status = statusFilter, search = searchQuery, page = 1 } = {}) => {
      if (!workspaceId)
        return { products: [], total: 0, page: 1, totalPages: 1 };
      setLoadingList(true);
      setError(null);
      try {
        const res = await fetchInspectedProductsListApi(
          { workspaceId, status, search, page, limit: 10 },
          token
        );
        setProducts(res.products || []);
        setPagination({
          total: res.total || 0,
          page: res.page || 1,
          totalPages: res.totalPages || 1,
        });

        if (res.products && res.products.length > 0) {
          const stillExists = res.products.some(
            (p) => String(p._id) === String(selectedProductId)
          );
          if (!stillExists) {
            const preferred =
              res.products.find(
                (p) => p.cleaningBadge === "Missing Value Detected"
              ) || res.products[0];
            await loadComparison(preferred._id);
          }
        } else {
          setSelectedProductId(null);
          setComparison(null);
        }

        return res;
      } catch (err) {
        setError(err.message || "Could not load inspected products.");
        return { products: [], total: 0, page: 1, totalPages: 1 };
      } finally {
        setLoadingList(false);
      }
    },
    [
      workspaceId,
      token,
      statusFilter,
      searchQuery,
      selectedProductId,
      loadComparison,
    ]
  );

  const runCleaningPipeline = useCallback(async () => {
    if (!workspaceId) {
      setError(
        "No active workspace found. Please create or select a workspace."
      );
      return false;
    }
    setAnalyzing(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await executeDataCleaningPipelineApi(
        { workspaceId },
        token
      );
      if (res.auditStats) {
        setMetrics(res.auditStats);
      } else {
        await loadMetrics();
      }
      await loadProducts({ status: statusFilter, search: searchQuery, page: 1 });
      setFeedback(
        res.message ||
          "Data Health validation process complete. Database fully normalized."
      );
      return true;
    } catch (err) {
      setError(err.message || "Data cleaning pipeline failed.");
      return false;
    } finally {
      setAnalyzing(false);
    }
  }, [
    workspaceId,
    token,
    statusFilter,
    searchQuery,
    loadMetrics,
    loadProducts,
  ]);

  const saveManualEdits = useCallback(
    async (productId, cleanedData) => {
      setSavingEdit(true);
      setCompareError(null);
      setFeedback(null);
      try {
        const res = await saveSingleCleanedProductApi(
          { productId, workspaceId, cleanedData },
          token
        );

        setProducts((prev) =>
          prev.map((item) =>
            String(item._id) === String(productId)
              ? {
                  ...item,
                  ...(res.product || {}),
                  cleanedData: { ...item.cleanedData, ...cleanedData },
                  cleaningBadge: "Normalized",
                }
              : item
          )
        );

        setComparison((prev) =>
          prev
            ? {
                ...prev,
                badgeStatus: "Normalized",
                cleanedView: { ...prev.cleanedView, ...cleanedData },
                summary: {
                  ...prev.summary,
                  missingFields: [],
                },
              }
            : null
        );

        if (res.auditStats) {
          setMetrics(res.auditStats);
        } else {
          await loadMetrics();
        }

        setFeedback(
          res.message ||
            "Manually customized edit processed & audit log updated."
        );
        return true;
      } catch (err) {
        setCompareError(
          err.message || "Failed to save changes. Please check your inputs."
        );
        return false;
      } finally {
        setSavingEdit(false);
      }
    },
    [workspaceId, token, loadMetrics]
  );

  return (
    <DataCleaningContext.Provider
      value={{
        metrics,
        products,
        pagination,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        selectedProductId,
        comparison,
        analyzing,
        loadingList,
        loadingCompare,
        savingEdit,
        error,
        compareError,
        feedback,
        setFeedback,
        loadMetrics,
        loadProducts,
        loadComparison,
        runCleaningPipeline,
        saveManualEdits,
      }}
    >
      {children}
    </DataCleaningContext.Provider>
  );
}

export function useDataCleaning() {
  const ctx = useContext(DataCleaningContext);
  if (!ctx) {
    throw new Error("useDataCleaning must be used inside DataCleaningProvider");
  }
  return ctx;
}