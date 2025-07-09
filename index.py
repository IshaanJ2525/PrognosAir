import streamlit as st
import streamlit.components.v1 as components
import os

# Serve the 3D viewer HTML with correct path
html_file_path = os.path.join(os.getcwd(), "prognosair.html")
with open(html_file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace path in HTML dynamically
html = html.replace("787-9.glb", "/public/787-9.glb")

# Display
st.set_page_config(layout="wide", page_title="PrognosAir")
st.title("PrognosAir - Aircraft Maintenance Viewer")
components.html(html, height=800)
