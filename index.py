import streamlit as st
import streamlit.components.v1 as components
import os

st.set_page_config(
    page_title="PrognosAir 3D Viewer",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Stretch HTML viewer across the screen
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
    """, unsafe_allow_html=True
)

# Read your existing working HTML
html_file = os.path.join(os.getcwd(), "prognosair.html")
with open(html_file, "r", encoding="utf-8") as f:
    html_code = f.read()

# Embed it within Streamlit using full viewport
components.html(html_code, height=900, scrolling=False)
