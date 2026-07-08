"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import AppModal from "@/components/AppModal";

type User = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT" | "CLIENT";
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("New User");
  const [email, setEmail] = useState("newuser@example.com");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState<"ADMIN" | "AGENT" | "CLIENT">("CLIENT");

  const [message, setMessage] = useState("");

  async function loadUsers() {
    const response = await fetch("/api/users");
    const result = await response.json();

    if (response.ok) {
      setUsers(result.data);
    } else {
      setMessage(result.message);
    }
  }

  function openCreateModal() {
    // Otvaramo modal za kreiranje novog korisnika.
    setEditingId(null);
    setName("New User");
    setEmail("newuser@example.com");
    setPassword("password123");
    setRole("CLIENT");
    setIsModalOpen(true);
  }

  function openEditModal(user: User) {
    // Otvaramo modal za izmenu postojećeg korisnika.
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
  }

  async function saveUser(event: React.FormEvent) {
    event.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/users/${editingId}` : "/api/users";

    const body: {
      name: string;
      email: string;
      role: string;
      password?: string;
    } = {
      name,
      email,
      role,
    };

    if (password) {
      body.password = password;
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    setMessage(result.message);

    if (response.ok) {
      closeModal();
      loadUsers();
    }
  }

  async function deleteUser(id: number) {
    const confirmed = confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    const response = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    setMessage(result.message);
    loadUsers();
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <main className="app-shell">
      <Navigation />

      <section className="modern-page">
        <div className="section-heading">
          <p className="eyebrow">Admin area.</p>
          <h1>Users CRUD.</h1>
          <p>Admin can create, read, update and delete users.</p>
        </div>

        <div className="action-row" style={{marginBottom: "30px"}}>
          <AppButton text="Create user" onClick={openCreateModal} />
        </div>

        {message && <p className="form-message">{message}</p>}

        <div className="table-box">
          <h2>All users</h2>

          {users.map((user) => (
            <div className="crud-row" key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>

              <span className="role-pill">{user.role}</span>

              <div className="crud-actions">
                <AppButton
                  text="Edit"
                  variant="secondary"
                  onClick={() => openEditModal(user)}
                />
                <AppButton
                  text="Delete"
                  variant="danger"
                  onClick={() => deleteUser(user.id)}
                />
              </div>
            </div>
          ))}
        </div>

        <AppModal
          isOpen={isModalOpen}
          title={editingId ? "Update user" : "Create user"}
          onClose={closeModal}
        >
          <form className="simple-form" onSubmit={saveUser}>
            <AppInput label="Name" value={name} onChange={setName} />
            <AppInput label="Email" value={email} onChange={setEmail} />

            <AppInput
              label={editingId ? "New password optional" : "Password"}
              type="password"
              value={password}
              onChange={setPassword}
            />

            <label className="input-group">
              <span>Role</span>
              <select
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as "ADMIN" | "AGENT" | "CLIENT")
                }
              >
                <option value="ADMIN">ADMIN</option>
                <option value="AGENT">AGENT</option>
                <option value="CLIENT">CLIENT</option>
              </select>
            </label>

            <div className="action-row">
              <AppButton
                text={editingId ? "Update user" : "Create user"}
                type="submit"
              />
              <AppButton
                text="Cancel"
                variant="secondary"
                onClick={closeModal}
              />
            </div>
          </form>
        </AppModal>
      </section>
    </main>
  );
}