import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./InteractivePage.css";

const SCRIPT_SOURCES = [
  "/js/matter-demo.main.cf6d09.min.js",
  "/js/matter-demo.matter-tools.0f82d2.min.js",
  "/js/matter-demo.matter-wrap.f14474.min.js",
  "/js/matter-demo.pathseg.f137cc.min.js",
  "/js/matter-demo.poly-decomp.6b3373.min.js",
  "/js/matter-demo.01bd65.min.js",
];

const injectedScripts = new Set<string>();

const Interactive: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptsRef = useRef<HTMLScriptElement[]>([]);

  useEffect(() => {
    // Inject scripts if not already loaded
    const newScripts = SCRIPT_SOURCES.filter(src => !injectedScripts.has(src));
    newScripts.forEach(src => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.dataset.injected = "true";
      document.body.appendChild(script);
      scriptsRef.current.push(script);
      injectedScripts.add(src);
    });

    // Show demo UI elements
    const showDemoElements = () => {
      const selectors = [
        ".matter-demo",
        ".matter-header-outer",
        ".matter-toolbar",
        ".matter-header",
        ".ins-container",
        ".dg.main",
      ];
      selectors.forEach(selector => {
        document.querySelectorAll<HTMLElement>(selector).forEach(el => {
          el.style.display = "";
        });
      });
    };

    // Hide demo UI elements
    const hideDemoElements = () => {
      const selectors = [
        ".matter-demo",
        ".matter-header-outer",
        ".matter-toolbar",
        ".matter-header",
        ".ins-container",
        ".dg.main",
      ];
      selectors.forEach(selector => {
        document.querySelectorAll<HTMLElement>(selector).forEach(el => {
          el.style.display = "none";
        });
      });
    };

    showDemoElements();

    return () => {
      // Cleanup injected scripts
      scriptsRef.current.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        injectedScripts.delete(script.src);
      });
      scriptsRef.current = [];

      // Hide demo UI elements on unmount
      hideDemoElements();

      // Remove canvases inside container to avoid leftover visuals
      if (containerRef.current) {
        containerRef.current.querySelectorAll("canvas").forEach(c => c.remove());
      }
    };
  }, []);

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .matter-btn-compare.matter-btn {
          font-size: 18px;
          text-align: center;
          line-height: 32px;
        }
        .matter-js-compare-build.matter-demo {
          position: absolute;
          background: none;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
          pointer-events: none;
        }
        .matter-js-compare-build.matter-demo .matter-header-outer {
          display: none;
        }
        .matter-js.dev.comparing.matter-demo canvas {
          background: transparent !important;
          z-index: 20;
        }
        .matter-js-compare-build.matter-demo canvas {
          opacity: 0.5;
          background: transparent !important;
          z-index: 15 !important;
        }
        @media only screen and (min-width: 1300px) {
          .matter-demo canvas {
            position: relative;
            z-index: 20;
          }
          .matter-js-compare-build.matter-demo canvas {
            position: relative;
            z-index: 15;
          }
        }
      `}</style>

      <div className="container">
        <div className="button-container2">
          <button
            id="button1"
            onClick={() => {
              navigate("/");
              window.history.replaceState(null, "", "/");
            }}
          >
            Go to Home Page
          </button>
        </div>
      </div>

      <div ref={containerRef} id="matter-container" />
    </>
  );
};

export default Interactive;
