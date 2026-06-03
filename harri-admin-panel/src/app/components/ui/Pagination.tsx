import { Next, Prev } from "@/svg";
import ReactPaginate from "react-paginate";

// prop type
type IProps = {
  pageCount: number;
  handlePageClick: (event: { selected: number }) => void;
  focusPage?: number;
};

const PaginationTwo = ({ handlePageClick, pageCount, focusPage }: IProps) => {
  return (
    <ReactPaginate
      className="list-wrap"
      breakLabel="..."
      activeClassName="current"
      nextLabel={<Next/>}
      onPageChange={handlePageClick}
      forcePage={focusPage}
      pageRangeDisplayed={5}
      pageCount={pageCount}
      previousLabel={<Prev/>}
      renderOnZeroPageCount={null}
    />
  );
};

export default PaginationTwo;
