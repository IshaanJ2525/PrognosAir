import streamlit as st
import streamlit.components.v1 as components
import os

st.set_page_config(layout="wide")

# Streamlit UI
st.title("PrognosAir 3D Aircraft Viewer")
st.markdown("Click on parts of the aircraft to see maintenance info.")

# Load the HTML content
with open("prognosair.html", "r", encoding="utf-8") as f:
    html_content = f.read()

# Display the HTML with full width and height
components.html(html_content, height=800, width=None)
