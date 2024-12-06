import type { DataType } from "../App.tsx";
import { Input, Form, Checkbox } from "antd";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "boolean" | "text";
  record: DataType;
  index: number;
}

export const EditableCell: React.FC<
  React.PropsWithChildren<EditableCellProps>
> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  let booleanVal = false;
  if (dataIndex === "completed") {
    booleanVal = record[dataIndex];
  }
  const inputNode =
    inputType === "boolean" ? (
      <Checkbox defaultChecked={booleanVal} />
    ) : (
      <Input />
    );
  const valuePropName = inputType === "boolean" ? "checked" : "value";

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
          valuePropName={valuePropName}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
