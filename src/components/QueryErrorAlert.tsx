import { MdErrorOutline } from "react-icons/md";

interface QueryErrorAlertProps {
  message: string | undefined;
}

const QueryErrorAlert = ({ message }: QueryErrorAlertProps) => {
  return (
    <div className="alert alert-error m-auto h-fit max-w-xl justify-start gap-4">
      <MdErrorOutline size={28} className="shrink-0" />
      <span>Error: {message}</span>
    </div>
  );
};

export default QueryErrorAlert;
