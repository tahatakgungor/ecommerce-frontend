export async function loadCategory() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category/show`)
  const data = await res.json();
  return data
}