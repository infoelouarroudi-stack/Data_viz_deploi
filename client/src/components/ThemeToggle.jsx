import { Moon, Sun } from "lucide-react";
import PropTypes from "prop-types";

const ThemeToggle = () => {
  return null;
};

ThemeToggle.propTypes = {
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
  toggleTheme: PropTypes.func.isRequired,
};

export default ThemeToggle;
