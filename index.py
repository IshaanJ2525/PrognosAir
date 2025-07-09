import streamlit as st
import streamlit.components.v1 as components
from pathlib import Path

st.set_page_config(layout="wide")

# Custom CSS to make iframe fill screen
st.markdown(
    """
    <style>
    .appview-container iframe {
      position: fixed !important;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      border: none;
    }
    .block-container { padding: 0 !important; }
    </style>
    """,
    unsafe_allow_html=True
)

# Read HTML content
html_file = Path(__file__).parent / "prognosair.html"
html = html_file.read_text(encoding="utf-8")

# Embed HTML viewer
components.html(html, height=900, scrolling=False)
