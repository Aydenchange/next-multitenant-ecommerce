type props = {
  params: Promise<{ category: string }>;
};

const Page = async ({ params }: props) => {
  const category = await params;
  return <div>Category: {category.category}</div>;
};

export default Page;
