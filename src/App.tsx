import { useState } from "react";

import "./App.css";
import { Button } from "antd";
import { Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";

function App() {
  const [tasks, setTasks] = useState(localStorage.getItem("tasks") ?? []);

  return (
    <div className="container">
      <h1 className="mb-4">TODO App</h1>
      <div className="wrapper">
        <Input placeholder="Task" allowClear size="large" />
        <Button
          type="primary"
          size="large"
          className="ml-4"
          icon={<PlusOutlined />}
        >
          Add Task
        </Button>
      </div>
    </div>
  );
}

export default App;
