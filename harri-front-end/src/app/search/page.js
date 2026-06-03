import SearchAreaMain from "@components/search-area";

export const metadata = {
  title: "Search Product - Serravit",
};

export default async function SearchPage({ searchParams }) {
  const { query, page, sort } = await searchParams;
  return (
    <SearchAreaMain searchText={query} page={page} sort={sort} />
  );
}
