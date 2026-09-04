import React from "react";
import { Link } from "react-router-dom";

const Forbidden = () => {
    return (
        <div
            className="d-flex align-items-center justify-content-center min-vh-100 bg-light w-100" 
        >
            <div className="text-center">
                <h1
                    className="display-1 fw-bold text-danger"
                    style={{ fontSize: "120px" }}
                >
                    403
                </h1>

                <h2 className="fw-bold mb-3">
                    Access Forbidden
                </h2>

                <p className="text-muted mb-4">
                    You don't have permission to access this page.
                </p>

                <div className="d-flex justify-content-center gap-2">
                    <Link to="/" className="btn btn-primary">
                        Go to Dashboard
                    </Link>

                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Forbidden;
