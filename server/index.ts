import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3020;
const NODE_ENV = process.env.NODE_ENV || "development";

const DATA_DIR = path.join(__dirname, "../data");

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3030",
    credentials: true,
  }),
);
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

type MindMapPosition = {
  x: number;
  y: number;
};

type MindMapNode = {
  id: string;
  label?: string;
  type?: string;
  position?: MindMapPosition;
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

type MindMapEdge = {
  id?: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

type MindMapLayout = {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  updatedAt?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isPosition = (value: unknown): value is MindMapPosition => {
  return (
    isRecord(value) &&
    typeof value.x === "number" &&
    Number.isFinite(value.x) &&
    typeof value.y === "number" &&
    Number.isFinite(value.y)
  );
};

const coerceNodes = (value: unknown): MindMapNode[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const id = item.id;
      if (typeof id !== "string" || id.trim().length === 0) {
        return null;
      }

      const node: MindMapNode = { id };

      if (typeof item.label === "string") {
        node.label = item.label;
      }

      if (typeof item.type === "string") {
        node.type = item.type;
      }

      if ("position" in item && isPosition(item.position)) {
        node.position = item.position;
      }

      if (isRecord(item.data)) {
        node.data = item.data;
      }

      return node;
    })
    .filter((node): node is MindMapNode => node !== null);
};

const coerceEdges = (value: unknown): MindMapEdge[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const source = item.source;
      const target = item.target;

      if (typeof source !== "string" || typeof target !== "string") {
        return null;
      }

      const edge: MindMapEdge = { source, target };

      if (typeof item.id === "string") {
        edge.id = item.id;
      }

      if (typeof item.type === "string") {
        edge.type = item.type;
      }

      if (typeof item.label === "string") {
        edge.label = item.label;
      }

      if (isRecord(item.data)) {
        edge.data = item.data;
      }

      return edge;
    })
    .filter((edge): edge is MindMapEdge => edge !== null);
};

type MindMapMetadata = {
  id: string;
  name: string;
  description?: string;
  template?: string;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
};

const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

await ensureDataDir();

const readJsonFile = async <T>(filePath: string, fallback: T): Promise<T> => {
  try {
    const file = await fs.readFile(filePath, "utf-8");
    return JSON.parse(file) as T;
  } catch {
    return fallback;
  }
};

const normalizeLayout = (raw: unknown): MindMapLayout => {
  if (!isRecord(raw)) {
    return { nodes: [], edges: [] };
  }

  const updatedAt =
    typeof raw.updatedAt === "string" ? raw.updatedAt : undefined;

  if (Array.isArray(raw.nodes) && Array.isArray(raw.edges)) {
    return {
      nodes: coerceNodes(raw.nodes),
      edges: coerceEdges(raw.edges),
      updatedAt,
    };
  }

  if (
    isRecord(raw.layout) &&
    Array.isArray(raw.layout.nodes) &&
    Array.isArray(raw.layout.edges)
  ) {
    const layoutUpdatedAt =
      typeof raw.layout.updatedAt === "string"
        ? raw.layout.updatedAt
        : updatedAt;

    return {
      nodes: coerceNodes(raw.layout.nodes),
      edges: coerceEdges(raw.layout.edges),
      updatedAt: layoutUpdatedAt,
    };
  }

  if (isRecord(raw.layout)) {
    const nodes = Object.entries(raw.layout).map(([nodeId, value]) => {
      const node: MindMapNode = {
        id: nodeId,
        label: nodeId,
        type: nodeId === "root" ? "root" : "leaf",
      };

      const positionCandidate = isRecord(value)
        ? (value.position ?? value)
        : value;
      if (isPosition(positionCandidate)) {
        node.position = positionCandidate;
      }

      return node;
    });

    const edges = coerceEdges(raw.edges);

    return {
      nodes,
      edges,
      updatedAt,
    };
  }

  return {
    nodes: coerceNodes(raw.nodes),
    edges: coerceEdges(raw.edges),
    updatedAt,
  };
};

const saveLayoutFile = async (
  id: string,
  layout: MindMapLayout,
  timestamp: string,
) => {
  const filePath = path.join(DATA_DIR, `${id}-layout.json`);
  const payload = {
    nodes: layout.nodes,
    edges: layout.edges,
    updatedAt: timestamp,
  };
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");
};

const updateMetadataStats = async (
  id: string,
  nodeCount: number,
  timestamp: string,
) => {
  const metadataPath = path.join(DATA_DIR, `${id}-metadata.json`);
  try {
    const metadata = await readJsonFile<MindMapMetadata | null>(
      metadataPath,
      null,
    );
    if (!metadata) {
      return;
    }

    metadata.nodeCount = nodeCount;
    metadata.updatedAt = timestamp;

    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      "utf-8",
    );
  } catch (error) {
    console.warn(`Unable to update metadata for mindmap ${id}:`, error);
  }
};

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

app.get("/api", (req: Request, res: Response) => {
  res.json({
    name: "Slot Game API",
    version: "1.0.0",
    description: "規格驅動老虎機遊戲 API",
    endpoints: {
      health: "/api/health",
      spin: "/api/spin",
      validate: "/api/validate",
      simulate: "/api/simulate",
    },
  });
});

app.post("/api/spin", async (req: Request, res: Response) => {
  try {
    const { bet = 1, seed } = req.body;

    const mockResult = {
      roundId: `round-${Date.now()}`,
      bet,
      seed: seed || `seed-${Date.now()}`,
      grid: [
        ["A", "K", "Q"],
        ["K", "Q", "J"],
        ["Q", "J", "10"],
        ["J", "10", "9"],
        ["10", "9", "A"],
      ],
      wins: [
        {
          lineId: "L1",
          symbol: "K",
          count: 3,
          payout: 5,
        },
      ],
      totalWin: 5,
      timestamp: new Date().toISOString(),
    };

    res.json(mockResult);
  } catch (error) {
    console.error("Spin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/mindmap/layout/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}-layout.json`);

    const rawLayout = await readJsonFile<unknown | null>(filePath, null);
    const normalized = normalizeLayout(rawLayout);

    res.json({
      success: true,
      layout: {
        nodes: normalized.nodes,
        edges: normalized.edges,
        updatedAt: normalized.updatedAt,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get layout error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load layout",
    });
  }
});

app.post("/api/mindmap/layout/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { layout } = req.body;

    if (!layout) {
      return res.status(400).json({
        success: false,
        error: "Layout data is required",
      });
    }

    const timestamp = new Date().toISOString();
    const normalized = normalizeLayout(layout);

    await saveLayoutFile(id, normalized, timestamp);
    await updateMetadataStats(id, normalized.nodes.length, timestamp);

    res.json({
      success: true,
      message: "Layout saved successfully",
      timestamp,
    });
  } catch (error) {
    console.error("Save layout error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save layout",
    });
  }
});

app.delete("/api/mindmap/layout/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}-layout.json`);

    try {
      await fs.unlink(filePath);
      res.json({
        success: true,
        message: "Layout deleted successfully",
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.json({
        success: true,
        message: "Layout already deleted",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Delete layout error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete layout",
    });
  }
});

app.get("/api/mindmap/list", async (req: Request, res: Response) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const metadataFiles = files.filter((file) =>
      file.endsWith("-metadata.json"),
    );

    const mindmaps = await Promise.all(
      metadataFiles.map(async (file) => {
        const filePath = path.join(DATA_DIR, file);
        try {
          const metadata = await readJsonFile<MindMapMetadata | null>(
            filePath,
            null,
          );
          if (!metadata) {
            return null;
          }

          return {
            id: metadata.id,
            name: metadata.name,
            createdAt: metadata.createdAt,
            updatedAt: metadata.updatedAt,
            nodeCount: metadata.nodeCount ?? 0,
          };
        } catch (error) {
          console.error(`Error reading metadata ${file}:`, error);
          return null;
        }
      }),
    );

    const validMindmaps = mindmaps
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

    res.json({
      success: true,
      mindmaps: validMindmaps,
      count: validMindmaps.length,
    });
  } catch (error) {
    console.error("List mindmaps error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list mindmaps",
    });
  }
});

app.post("/api/mindmap/create", async (req: Request, res: Response) => {
  try {
    const { name, description, template = "blank" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Name is required",
      });
    }

    const id = `mindmap-${Date.now()}`;
    const now = new Date().toISOString();

    const metadata: MindMapMetadata = {
      id,
      name: name.trim(),
      description: description ?? "",
      template,
      createdAt: now,
      updatedAt: now,
      nodeCount: 0,
    };

    const metadataPath = path.join(DATA_DIR, `${id}-metadata.json`);
    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      "utf-8",
    );

    let initialLayout: MindMapLayout = { nodes: [], edges: [] };

    if (template === "basic") {
      initialLayout = {
        nodes: [
          {
            id: "root",
            label: "New Mind Map",
            type: "root",
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
      };
      metadata.nodeCount = initialLayout.nodes.length;
    } else if (template === "sdd") {
      try {
        const sddRaw = await readJsonFile<unknown | null>(
          path.join(DATA_DIR, "sdd-mindmap-layout.json"),
          null,
        );
        const normalized = normalizeLayout(sddRaw);
        initialLayout = {
          nodes: normalized.nodes,
          edges: normalized.edges,
        };
        metadata.nodeCount = normalized.nodes.length;
      } catch (error) {
        console.warn("Failed to load SDD template, fallback to blank", error);
      }
    }

    await saveLayoutFile(id, initialLayout, now);
    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      "utf-8",
    );

    res.json({
      success: true,
      id,
      name: metadata.name,
      message: "Mind map created successfully",
    });
  } catch (error) {
    console.error("Create mindmap error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create mindmap",
    });
  }
});

app.get("/api/mindmap/metadata/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}-metadata.json`);

    const metadata = await readJsonFile<MindMapMetadata | null>(filePath, null);
    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: "Mind map not found",
      });
    }

    res.json({
      success: true,
      metadata,
    });
  } catch (error) {
    console.error("Get metadata error:", error);
    res.status(404).json({
      success: false,
      error: "Mind map not found",
    });
  }
});

app.put("/api/mindmap/metadata/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const filePath = path.join(DATA_DIR, `${id}-metadata.json`);

    const metadata = await readJsonFile<MindMapMetadata | null>(filePath, null);
    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: "Mind map not found",
      });
    }

    if (name !== undefined) {
      metadata.name = name.trim();
    }
    if (description !== undefined) {
      metadata.description = description;
    }
    metadata.updatedAt = new Date().toISOString();

    await fs.writeFile(filePath, JSON.stringify(metadata, null, 2), "utf-8");

    res.json({
      success: true,
      metadata,
      message: "Metadata updated successfully",
    });
  } catch (error) {
    console.error("Update metadata error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update metadata",
    });
  }
});

app.delete("/api/mindmap/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const metadataPath = path.join(DATA_DIR, `${id}-metadata.json`);
    const layoutPath = path.join(DATA_DIR, `${id}-layout.json`);

    await Promise.all([
      fs.unlink(metadataPath).catch(() => undefined),
      fs.unlink(layoutPath).catch(() => undefined),
    ]);

    res.json({
      success: true,
      message: "Mind map deleted successfully",
    });
  } catch (error) {
    console.error("Delete mindmap error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete mindmap",
    });
  }
});

app.post("/api/validate", async (req: Request, res: Response) => {
  try {
    const { spec } = req.body;

    if (!spec) {
      return res.status(400).json({
        error: "Bad request",
        message: "缺少規格檔案",
      });
    }

    res.json({
      valid: true,
      spec,
      message: "規格驗證通過",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Validate API error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/simulate", async (req: Request, res: Response) => {
  try {
    const { spec, spins = 10000, seed } = req.body;

    if (!spec) {
      return res.status(400).json({
        error: "Bad request",
        message: "缺少規格檔案",
      });
    }

    res.json({
      spins,
      seed: seed || `seed-${Date.now()}`,
      rtp: 0.9489,
      hitRate: 0.3512,
      volatility: 28.45,
      maxWin: 875,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Simulate API error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not found",
    message: `路徑 ${req.path} 不存在`,
  });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: NODE_ENV === "development" ? err.message : "伺服器錯誤",
    ...(NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

app.listen(PORT, () => {
  console.log("");
  console.log("🚀 伺服器已啟動");
  console.log("================");
  console.log(`環境：${NODE_ENV}`);
  console.log(`後端：http://localhost:${PORT}`);
  console.log(`API：http://localhost:${PORT}/api`);
  console.log(`健康檢查：http://localhost:${PORT}/api/health`);
  console.log("");
});

export default app;
