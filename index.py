import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="PrognosAir Viewer", layout="wide")

with open("prognosair.html", "r", encoding="utf-8") as f:
    html = f.read()

components.html(html, height=800, scrolling=False)
