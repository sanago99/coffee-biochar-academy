"use client";

import { useState } from "react";
import { db } from "../../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import AdminGuard from "../../components/AdminGuard";
import Message, { MessageState } from "../../components/Message";
import { useModules } from "../../hooks/useModules";
import { useSessions } from "../../hooks/useSessions";
import { page, inputStyle, btn, colors } from "../../styles";

export default function AdminContent() {
  const { modules, refresh: refreshModules } = useModules();
  const { sessions, refresh: refreshSessions } = useSessions();

  /* MODULE FORM */
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleOrder, setModuleOrder] = useState<number>(1);
  const [moduleFormLink, setModuleFormLink] = useState("");
  const [moduleMessage, setModuleMessage] = useState<MessageState>(null);

  /* SESSION FORM */
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionLink, setSessionLink] = useState("");
  const [sessionMaterial, setSessionMaterial] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [sessionMessage, setSessionMessage] = useState<MessageState>(null);

  /* CREATE MODULE */

  const createModule = async () => {
    if (!moduleTitle) {
      setModuleMessage({ text: "Escribe el nombre del módulo", type: "error" });
      return;
    }

    try {
      await addDoc(collection(db, "modules"), {
        title: moduleTitle,
        order: moduleOrder,
        formLink: moduleFormLink,
        passingScore: 60,
      });

      setModuleTitle("");
      setModuleFormLink("");
      setModuleMessage({ text: "Módulo creado correctamente", type: "success" });
      refreshModules();
    } catch {
      setModuleMessage({ text: "Error al crear el módulo", type: "error" });
    }
  };

  /* CREATE SESSION */

  const createSession = async () => {
    if (!sessionTitle || !selectedModule) {
      setSessionMessage({ text: "Completa los campos obligatorios", type: "error" });
      return;
    }

    try {
      await addDoc(collection(db, "sessions"), {
        title: sessionTitle,
        link: sessionLink,
        material: sessionMaterial,
        moduleId: selectedModule,
        locked: false,
      });

      setSessionTitle("");
      setSessionLink("");
      setSessionMaterial("");
      setSessionMessage({ text: "Sesión creada correctamente", type: "success" });
      refreshSessions();
    } catch {
      setSessionMessage({ text: "Error al crear la sesión", type: "error" });
    }
  };

  return (
    <AdminGuard>
      <div style={page}>
        <h1>Gestión de contenido</h1>

        {/* CREATE MODULE */}

        <h2 style={{ marginTop: "40px" }}>Crear módulo</h2>

        <input
          placeholder="Nombre del módulo"
          value={moduleTitle}
          onChange={e => setModuleTitle(e.target.value)}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Orden del módulo"
          value={moduleOrder}
          onChange={e => setModuleOrder(Number(e.target.value))}
          style={inputStyle}
        />
        <input
          placeholder="Link evaluación (Google Forms)"
          value={moduleFormLink}
          onChange={e => setModuleFormLink(e.target.value)}
          style={inputStyle}
        />

        <Message message={moduleMessage} />

        <button onClick={createModule} style={{ ...btn(colors.green), marginTop: "10px" }}>
          Crear módulo
        </button>

        {/* CREATE SESSION */}

        <h2 style={{ marginTop: "50px" }}>Crear sesión</h2>

        <input
          placeholder="Título sesión"
          value={sessionTitle}
          onChange={e => setSessionTitle(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Link sesión (video)"
          value={sessionLink}
          onChange={e => setSessionLink(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Material adicional"
          value={sessionMaterial}
          onChange={e => setSessionMaterial(e.target.value)}
          style={inputStyle}
        />

        <select
          value={selectedModule}
          onChange={e => setSelectedModule(e.target.value)}
          style={{ ...inputStyle, marginTop: "10px" }}
        >
          <option value="">Seleccionar módulo</option>
          {modules.map(m => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>

        <Message message={sessionMessage} />

        <button onClick={createSession} style={{ ...btn(colors.yellow), marginTop: "10px", color: "#111" }}>
          Crear sesión
        </button>

        {/* MODULE LIST */}

        <h2 style={{ marginTop: "50px" }}>Módulos existentes</h2>

        {modules.map(module => {
          const moduleSessions = sessions.filter(s => s.moduleId === module.id);
          return (
            <div
              key={module.id}
              style={{
                border: `1px solid ${colors.border}`,
                padding: "15px",
                borderRadius: "8px",
                marginTop: "10px",
              }}
            >
              <h3>{module.title}</h3>
              <p style={{ color: colors.textMuted }}>Orden: {module.order}</p>
              <p style={{ color: colors.textMuted }}>{moduleSessions.length} sesiones</p>
            </div>
          );
        })}
      </div>
    </AdminGuard>
  );
}
