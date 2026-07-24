import { useEffect, useState } from "react";
import Api from "./services/api";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const getToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = getToday();

  const [name, setName] = useState("");
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState("Present");

  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState("");

  const [filterDate, setFilterDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const getUsers = async () => {
    try {
      const res = await Api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const userData = {
      name,
      date,
      status,
    };

    try {
      if (editId) {
        await Api.put(`/users/${editId}`, userData);
        alert("Attendance Updated Successfully");
      } else {
        await Api.post("/register", userData);
        alert("Attendance Added Successfully");
      }

      setName("");
      setDate(today);
      setStatus("Present");
      setEditId("");

      getUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this attendance?")) return;
    setLoading(true);
    try {
      await Api.delete(`/users/${id}`);
      getUsers();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setName(user.name);
    setDate(new Date(user.date).toISOString().split("T")[0]);
    setStatus(user.status);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const filteredUsers = users.filter(
    (user) => new Date(user.date).toISOString().split("T")[0] === filterDate,
  );

  const presentCount = filteredUsers.filter(
    (item) => item.status === "Present",
  ).length;

  const absentCount = filteredUsers.filter(
    (item) => item.status === "Absent",
  ).length;

  const totalStudents = filteredUsers.length;

  return (
    <div className="container py-5">
      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 9999,
          }}
        >
          <div className="text-center">
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-primary fw-bold">Please wait...</p>
          </div>
        </div>
      )}

      <div className="card shadow-lg border-0">
        <div className="card-body">
          <h2 className="text-center text-primary mb-4">
            Attendance Management System
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Student Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="col-md-3 mb-3">
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="col-md-3 mb-3">
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div className="col-md-2 mb-3">
                <button className="btn btn-primary w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      {editId ? "Updating..." : "Adding..."}
                    </>
                  ) : editId ? (
                    "Update"
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
            </div>
          </form>

          <hr />

          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label fw-bold">Filter By Date</label>
              <input
                type="date"
                className="form-control"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card bg-success text-white shadow">
                <div className="card-body text-center">
                  <h5>Present</h5>
                  <h2>{presentCount}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card bg-danger text-white shadow">
                <div className="card-body text-center">
                  <h5>Absent</h5>
                  <h2>{absentCount}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card bg-primary text-white shadow">
                <div className="card-body text-center">
                  <h5>Total Students</h5>
                  <h2>{totalStudents}</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No Attendance Found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{new Date(user.date).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            user.status === "Present"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEdit(user)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(user._id)}
                          disabled={loading}
                        >
                          {loading ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
