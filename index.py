import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="PrognosAir 3D Viewer",
    layout="wide",
    initial_sidebar_state="collapsed"
)

st.markdown("""
    <style>
        iframe {
            height: 100vh;
            width: 100vw;
            border: none;
        }
        .block-container {
            padding: 0;
        }
    </style>
""", unsafe_allow_html=True)

st.title("PrognosAir - 3D Aircraft Maintenance Viewer")

# Embed the full HTML app into the Streamlit app
with open("prognosair.html", "r") as f:
    html_string = f.read()

components.html(html_string, height=800, width=1400, scrolling=False)
