import ExportPDFPage from "@/app/staffs/components/ExportPDFPage";
import { DataExport } from "@/stores/reportStore";
import React from "react";

interface Props {
  dataExports?: any;
}

export default function ExportPDFMultiple(props: Props) {
  const { dataExports } = props;
  return (
    <div>
      {dataExports?.map(
        (
          dataExport: DataExport | undefined,
          index: React.Key | null | undefined
        ) => {
          return <ExportPDFPage key={index} dataExport={dataExport} />;
        }
      )}
    </div>
  );
}
