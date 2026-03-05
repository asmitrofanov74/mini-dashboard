import React, { useRef, useMemo, useState, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import styled, { ThemeProvider } from "styled-components";
import {
  useFilters,
  useTheme,
  useUiStore,
  useSetFilters,
  usePageSize,
  useSetPageSize,
} from "./store/uiStore";
import { useToggleTask } from "./api/useToggleTask";
import { GlobalStyle } from "./GlobalStyle";
import { lightTheme, darkTheme } from "./theme";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;
const Filters = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;
const Input = styled.input`
  padding: 8px;
  border: 1px solid gray;
`;
const Select = styled.select`
  padding: 8px;
  border: 1px solid gray;
`;
const Header = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 100px;
  gap: 10px;
  padding: 10px;
  background: #f0f0f0;
  font-weight: bold;
`;
const Row = styled.div<{ status: string }>`
  display: grid;
  grid-template-columns: 2fr 1fr 100px;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
  background: ${({ status, theme }) =>
    status === "active" ? theme.statusActive : "#ffcc00"};
`;
const Button = styled.button`
  padding: 4px 8px;
  background: #ef4444;
  color: white;
  border: none;
  cursor: pointer;
`;
const TableBox = styled.div`
  height: 500px;
  border: 1px solid #ccc;
  overflow: auto;
`;
const Pagination = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  align-items: center;
`;

interface Task {
  id: number;
  title: string;
  status: "active" | "paused";
}

export default function Dashboard() {
  const themeName = useTheme();
  const theme = themeName === "dark" ? darkTheme : lightTheme;
  const filters = useFilters();
  const setFilters = useSetFilters();
  const setPageSize = useSetPageSize();
  const pageSize = usePageSize();
  const toggleTask = useToggleTask();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("http://localhost:3001/tasks")
      .then((res) => res.json())
      .then((data: Task[]) => setTasks(data))
      .catch(console.error);
  }, []);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      filtered = filtered.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (filters.status !== "all") {
      filtered = filtered.filter((t) => t.status === filters.status);
    }
    return filtered;
  }, [tasks, filters.q, filters.status]);

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: paginatedTasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.q, filters.status, pageSize]);

  const toggleTaskStatus = (task: Task) => {
    // Сразу обновляем локально
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: t.status === "active" ? "paused" : "active" }
          : t
      )
    );

    // И отправляем на сервер
    toggleTask.mutate({
      ...task,
      status: task.status === "active" ? "paused" : "active",
    });
  };

  const totalPages = Math.ceil(filteredTasks.length / pageSize);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Container>
        <h1>Dashboard (Client-side Filter + Pagination)</h1>
        <Filters>
          <Input
            placeholder="Search"
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
          />
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value as any })}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </Select>
          <Select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={50}>50/page</option>
            <option value={100}>100/page</option>
          </Select>
          <Button
            onClick={() =>
              useUiStore
                .getState()
                .setTheme(themeName === "light" ? "dark" : "light")
            }
          >
            {themeName === "light" ? "🌙 Dark" : "☀️ Light"}
          </Button>
        </Filters>
        <Swiper spaceBetween={10} slidesPerView={4}>
          {filteredTasks.slice(0, 20).map((task) => (
            <SwiperSlide key={task.id}>
              <div
                style={{
                  padding: "10px",
                  background: task.status === "active" ? "#a0f0a0" : "#ffcc00",
                  borderRadius: "6px",
                  textAlign: "center",
                }}
              >
                <strong>{task.title}</strong>
                <div>{task.status.toUpperCase()}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <Header>
          <span>Title</span> <span>Status</span> <span>Action</span>
        </Header>
        <TableBox ref={parentRef}>
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const task = paginatedTasks[virtualRow.index];
              if (!task) return null;
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <Row status={task.status}>
                    <span>{task.title}</span>
                    <span>{task.status.toUpperCase()}</span>
                    <Button onClick={() => toggleTaskStatus(task)}>
                      {task.status === "active" ? "⏸️ Pause" : "▶️ Active"}
                    </Button>
                  </Row>
                </div>
              );
            })}
          </div>
        </TableBox>

        <Pagination>
          <Button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Prev
          </Button>
          <span>
            Page {currentPage} of {totalPages} | Total: {filteredTasks.length}
          </span>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </Button>
        </Pagination>
      </Container>
    </ThemeProvider>
  );
}
