import { Moon, Sun } from "lucide-react";
import PropTypes from "prop-types";

const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon size={20} className="text-muted" />
      ) : (
        <Sun size={20} color="#fbbf24" />
      )}
    </button>
  );
};

ThemeToggle.propTypes = {
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
  toggleTheme: PropTypes.func.isRequired,
};

export default ThemeToggle;
