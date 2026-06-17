import { getAllRoomsAdmin } from "@/lib/data";
import { AdminRoomsTable } from "@/components/admin/admin-rooms-table";

export default async function AdminRoomsPage() {
  const rooms = await getAllRoomsAdmin();

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Salles</h2>
      <AdminRoomsTable rooms={rooms} />
    </section>
  );
}
