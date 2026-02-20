import { useState } from "react";
import GenerateInvoice from "../components/GenerateInvoice";
import TemplateForm from "../components/TemplateForm";
import InvoiceHistory from "../components/InvoiceHistory";
import sisLogo from "../assets/sis-logo.png";
import "./Dashboard.css";

import { FiLogOut } from "react-icons/fi";
import { LuFileText } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { LiaHistorySolid } from "react-icons/lia";

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("generate");

    return (
        <div className="dashboard">
            {/* Header */}
            <nav className="navbar border-bottom shadow-sm">
                <div className="container">
                    <div className="navbar-brand d-flex align-items-center gap-2">
                        <img src={sisLogo} alt="SIS" height="36" />
                        <span className="fw-bold fs-4">SIS</span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <span className="text-muted small d-none d-sm-inline">
                            user@example.com
                        </span>
                        <button className="btn btn-sm btn-outline-secondary">
                            <FiLogOut />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="container py-4">
                {/* Tabs */}
                <nav className="nav-tabs mb-4 custom-tabs">
                    <div className="nav-item">
                        <button
                            onClick={() => setActiveTab("generate")}
                            className={`${activeTab === "generate" && "active"} gap-2 nav-link`}
                        >
                            <LuFileText /> Generate
                        </button>
                    </div>
                    <div className="nav-item">
                        <button
                            onClick={() => setActiveTab("template")}
                            className={`${activeTab === "template" && "active"} gap-2 nav-link`}
                        >
                            <IoSettingsOutline /> Template
                        </button>
                    </div>
                    <div className="nav-item">
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`${activeTab === "history" && "active"} gap-2 nav-link`}
                        >
                            <LiaHistorySolid /> History
                        </button>
                    </div>
                </nav>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === "generate" && <GenerateInvoice />}
                    {activeTab === "template" && <TemplateForm />}
                    {activeTab === "history" && <InvoiceHistory />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
