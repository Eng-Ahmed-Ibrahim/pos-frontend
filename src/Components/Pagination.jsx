import React from "react";
import { GrPrevious , GrNext  } from "react-icons/gr";

export default function Pagination({ currentPage, lastPage, onPageChange }) {
    if (lastPage <= 1) return null;

    const getPages = () => {
        const pages = [];
        const delta = 7; // 7 قبل و 7 بعد

        const start = Math.max(1, currentPage - delta);
        const end = Math.min(lastPage, currentPage + delta);

        // أول صفحة
        if (start > 1) {
            pages.push(1);

            if (start > 2) {
                pages.push("...");
            }
        }

        // الصفحات الوسط
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // آخر صفحة
        if (end < lastPage) {
            if (end < lastPage - 1) {
                pages.push("...");
            }

            pages.push(lastPage);
        }

        return pages;
    };

    const pages = getPages();

    return (
        <div className="d-flex justify-content-center mt-3 gap-2 flex-wrap">

            {/* Prev */}
            <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <GrPrevious />

            </button>


            {/* Pages */}
            {pages.map((page, index) => {
                if (page === "...") {
                    return (
                        <span key={index} className="px-2 text-muted">
                            ...
                        </span>
                    );
                }

                return (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={`btn btn-sm ${
                            page === currentPage
                                ? "btn-primary"
                                : "btn-outline-primary"
                        }`}
                    >
                        {page}
                    </button>
                );
            })}


            {/* Next */}
            <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === lastPage}
                onClick={() => onPageChange(currentPage + 1)}
            >
               <GrNext />

            </button>
        </div>
    );
}