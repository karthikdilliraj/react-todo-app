import React, { useState } from "react";

import "./App.css";
import {
  Button,
  Input,
  Table,
  Form,
  Typography,
  Popconfirm,
  Checkbox,
  Empty,
  Space,
  ConfigProvider,
  theme,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { EditableCell } from "./components/EditableCell.tsx";
import { AppTheme } from "./components/AppTheme.tsx";
import type { TableProps } from "antd";

export interface DataType {
  key: string;
  name: string;
  completed: boolean;
}

const genId = () => Math.random().toString(36).substring(2, 9);

function App() {
  const [form] = Form.useForm();
  const [data, setData] = useState<DataType[]>(
    localStorage.getItem("tasks")
      ? (JSON.parse(localStorage.getItem("tasks") as string) as DataType[])
      : []
  );
  const [editingKey, setEditingKey] = useState("");
  const [name, setName] = useState("");
  const initialTheme =
    localStorage.getItem("theme") ??
    (globalThis.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  const [currentTheme, setTheme] = useState(initialTheme);

  function handleInput(event: any) {
    setName(event.target.value);
  }

  function addTask() {
    const newData = [...data];
    newData.push({
      key: genId(),
      name,
      completed: false,
    });
    setData(newData);
    setName("");
    localStorage.setItem("tasks", JSON.stringify(newData));
  }

  const isEditing = (record: DataType) => record.key === editingKey;

  const edit = (record: Partial<DataType> & { key: React.Key }) => {
    form.setFieldsValue({
      name: "",
      completed: false,
      ...record,
    });
    setEditingKey(record.key);
  };

  const remove = (record: Partial<DataType> & { key: React.Key }) => {
    const newData = [...data];
    const index = newData.findIndex((item) => record.key === item.key);
    newData.splice(index, 1);
    setData(newData);
    localStorage.setItem("tasks", JSON.stringify(newData));
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as DataType;

      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey("");
      } else {
        row.key = genId();
        setData(newData);
        setEditingKey("");
      }
      localStorage.setItem("tasks", JSON.stringify(newData));
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: "30%",
      editable: true,
      sorter: (a: DataType, b: DataType) => {
        const nameA = a.name.toUpperCase(); // ignore upper and lowercase
        const nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      },
      showSorterTooltip: false,
    },
    {
      title: "Completed",
      dataIndex: "completed",
      width: "30%",
      editable: true,
      render: (_: any, record: DataType) => {
        return <Checkbox defaultChecked={record["completed"]} disabled />;
      },
      filters: [
        {
          text: "Completed",
          value: true,
        },
        {
          text: "Pending",
          value: false,
        },
      ],
      onFilter: (value: boolean, record: DataType) =>
        record.completed === value ? true : false,
    },
    {
      title: "Action",
      dataIndex: "action",
      width: "40%",
      render: (_: any, record: DataType) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{ marginInlineEnd: 8 }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Space size="middle">
            <Typography.Link
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
            >
              Edit
            </Typography.Link>
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this task?"
              onConfirm={() => remove(record)}
              okText="Yes"
              cancelText="No"
            >
              <Typography.Link type="danger">Delete</Typography.Link>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  //@ts-ignore
  const mergedColumns: TableProps<DataType>["columns"] = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        inputType: col.dataIndex === "completed" ? "boolean" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <ConfigProvider
      theme={{
        // 1. Use dark algorithm
        algorithm:
          currentTheme === "dark"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,

        // 2. Combine dark algorithm and compact algorithm
        // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      }}
    >
      <div>
        <header className="flex justify-center items-center text-xl font-semibold h-20 dark:text-white">
          <h1 className="flex-1 m-4 text-center">TODO App</h1>
          <AppTheme
            theme={currentTheme}
            onClick={(theme: string) => setTheme(theme)}
          />
        </header>
        <main className="container m-2 md:mx-auto text-center w-[95%] h-screen">
          <div className="flex flex-row items-center mb-4">
            <Input
              placeholder="Task"
              allowClear
              size="large"
              value={name}
              onInput={handleInput}
            />
            <Button
              type="default"
              size="large"
              className="ml-4"
              icon={<PlusOutlined />}
              onClick={addTask}
              disabled={name.trim() === ""}
            >
              Add Task
            </Button>
          </div>
          <Form form={form} component={false}>
            <Table<DataType>
              components={{
                body: { cell: EditableCell },
              }}
              bordered
              dataSource={data}
              columns={mergedColumns}
              rowClassName="editable-row"
              pagination={{ onChange: cancel }}
              locale={{ emptyText: <Empty description="No Data"></Empty> }}
            />
          </Form>
        </main>
      </div>
    </ConfigProvider>
  );
}

export default App;
