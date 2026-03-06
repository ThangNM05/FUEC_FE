import MajorList from './components/MajorList';

function AdminMajors() {
    return (
        <div className="p-4 md:p-6 bg-white min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Major & Sub-Major Settings</h1>
            </div>

            <MajorList />
        </div>
    );
}

export default AdminMajors;
