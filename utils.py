import streamlit as st

def render_custom_css():
    """
    Injects ultra-premium custom CSS to style the Streamlit app with glassmorphism, 
    gradients, and interactive animations to wow the user.
    """
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Space+Grotesk:wght@300;500;700&display=swap');

    /* Global Design System */
    :root {
        --primary: #00f2ff;
        --secondary: #7000ff;
        --bg-dark: #050a14;
        --glass-bg: rgba(255, 255, 255, 0.03);
        --glass-border: rgba(255, 255, 255, 0.08);
        --accent-glow: rgba(0, 242, 255, 0.15);
    }

    html, body, [class*="css"] {
        font-family: 'Outfit', sans-serif !important;
    }
    
    .stApp {
        background: radial-gradient(circle at 50% -20%, #1a2a44 0%, #050a14 100%) !important;
        color: #e0e6ed;
    }

    /* Cinematic Background Animation */
    @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    /* Floating Animation */
    @keyframes float {
        0% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(0.5deg); }
        100% { transform: translateY(0px) rotate(0deg); }
    }

    /* Glow Pulse */
    @keyframes pulseGlow {
        0% { box-shadow: 0 0 10px rgba(0, 242, 255, 0.2); }
        50% { box-shadow: 0 0 30px rgba(0, 242, 255, 0.5); }
        100% { box-shadow: 0 0 10px rgba(0, 242, 255, 0.2); }
    }

    /* Apply Fade In */
    .main .block-container {
        animation: fadeIn 1.2s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Ultra-Premium Glassmorphism Sidebar */
    [data-testid="stSidebar"] {
        background: rgba(5, 10, 20, 0.9) !important;
        backdrop-filter: blur(40px) saturate(180%);
        border-right: 1px solid var(--glass-border);
    }
    
    /* Elegant Sidebar Sectioning */
    [data-testid="stSidebarNav"] {
        background: transparent !important;
    }

    /* Style the Sidebar "Choose Mode" Selectbox specifically */
    div[data-testid="stSelectbox"] > label {
        color: var(--primary) !important;
        font-family: 'Space Grotesk', sans-serif !important;
        font-weight: 700 !important;
        letter-spacing: 1px;
        text-transform: uppercase;
        font-size: 11px !important;
        margin-bottom: 8px !important;
    }

    div[data-testid="stSelectbox"] > div:first-child {
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid var(--glass-border) !important;
        border-radius: 14px !important;
        padding: 4px !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    div[data-testid="stSelectbox"] > div:first-child:hover {
        border-color: var(--primary) !important;
        box-shadow: 0 0 20px rgba(0, 242, 255, 0.2) !important;
        background: rgba(255, 255, 255, 0.08) !important;
    }

    /* Dropdown List Styling */
    div[data-baseweb="popover"] {
        background: rgba(10, 15, 25, 0.95) !important;
        backdrop-filter: blur(20px) !important;
        border: 1px solid var(--glass-border) !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 50px rgba(0,0,0,0.6) !important;
    }

    ul[data-baseweb="menu"] {
        background: transparent !important;
    }

    li[data-baseweb="menu-item"] {
        background: transparent !important;
        color: #fff !important;
        font-weight: 500 !important;
        padding: 12px 20px !important;
        margin: 4px 8px !important;
        border-radius: 10px !important;
        transition: all 0.2s ease !important;
    }

    /* Remove default focus borders that look messy */
    div[data-testid="stSelectbox"] > div:first-child:focus-within {
        border-color: var(--primary) !important;
        box-shadow: 0 0 15px var(--accent-glow) !important;
    }

    /* Style the text inside the selectbox */
    div[data-testid="stSelectbox"] span {
        color: #fff !important;
        font-weight: 600 !important;
        font-size: 14px !important;
    }
    
    /* Headers - Space Grotesk for a high-tech feel */
    h1, h2, h3 {
        font-family: 'Space Grotesk', sans-serif !important;
        background: linear-gradient(90deg, #fff 0%, #00f2ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 700 !important;
        text-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }

    /* Fancy Selectboxes & Inputs */
    .stSelectbox, .stTextInput, .stTextArea {
        background: var(--glass-bg) !important;
        border-radius: 12px !important;
        border: 1px solid var(--glass-border) !important;
        transition: all 0.3s ease !important;
    }
    .stSelectbox:focus-within, .stTextInput:focus-within, .stTextArea:focus-within {
        border-color: var(--primary) !important;
        box-shadow: 0 0 15px var(--accent-glow) !important;
    }

    /* Cyberpunk Buttons */
    div.stButton > button {
        background: linear-gradient(135deg, #00f2ff 0%, #7000ff 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 50px !important;
        padding: 15px 40px !important;
        font-weight: 700 !important;
        text-transform: uppercase;
        letter-spacing: 2px;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        box-shadow: 0 10px 20px rgba(112, 0, 255, 0.3) !important;
    }
    div.stButton > button:hover {
        transform: scale(1.05) translateY(-3px) !important;
        box-shadow: 0 20px 40px rgba(112, 0, 255, 0.5) !important;
        filter: brightness(1.2);
    }

    /* Medicine Cards - Ultra Fancy */
    .med-card {
        background: rgba(255, 255, 255, 0.02) !important;
        backdrop-filter: blur(15px);
        border: 1px solid var(--glass-border);
        border-radius: 24px;
        padding: 30px;
        text-align: center;
        transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        animation: float 6s ease-in-out infinite;
        position: relative;
        overflow: hidden;
    }
    .med-card::before {
        content: '';
        position: absolute;
        top: -50%; left: -50%; width: 200%; height: 200%;
        background: radial-gradient(circle, rgba(0, 242, 255, 0.05) 0%, transparent 70%);
        pointer-events: none;
    }
    .med-card:hover {
        background: rgba(255, 255, 255, 0.06) !important;
        border-color: var(--primary);
        transform: translateY(-15px) scale(1.02);
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), 0 0 20px var(--accent-glow);
    }
    .med-image {
        width: 140px;
        height: 140px;
        filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
        margin-bottom: 20px;
        transition: transform 0.5s ease;
    }
    .med-card:hover .med-image {
        transform: rotate(5deg) scale(1.1);
    }
    .med-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 22px;
        font-weight: 700;
        color: #fff;
        margin-bottom: 8px;
    }
    .med-manufacturer {
        font-size: 11px;
        color: var(--primary);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 15px;
    }
    .med-reason {
        font-size: 15px;
        color: rgba(255,255,255,0.7);
        line-height: 1.6;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: var(--bg-dark); }
    ::-webkit-scrollbar-thumb { 
        background: linear-gradient(var(--primary), var(--secondary));
        border-radius: 10px;
    }

    /* Risk Badges Upgraded */
    .risk-badge {
        padding: 10px 25px;
        border-radius: 50px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-size: 12px;
        display: inline-block;
        border: 1px solid rgba(255,255,255,0.1);
    }
    .risk-high { background: linear-gradient(45deg, #ff0055, #ff5e00); box-shadow: 0 0 20px rgba(255, 0, 85, 0.4); animation: pulseGlow 2s infinite; }
    .risk-medium { background: linear-gradient(45deg, #ffcc00, #ff6600); }
    .risk-low { background: linear-gradient(45deg, #00ffaa, #00ccff); }

    </style>
    """, unsafe_allow_html=True)

def render_medicine_card(name, manufacturer, reason, image_url=None):
    if not image_url:
        # Professional 3D-style medicine box icon
        image_url = "https://cdn-icons-png.flaticon.com/512/3022/3022874.png" 
        
    st.markdown(f"""
    <div class="med-card">
        <img src="{image_url}" class="med-image">
        <div class="med-title">{name}</div>
        <div class="med-manufacturer">{manufacturer}</div>
        <div class="med-reason">{reason}</div>
    </div>
    """, unsafe_allow_html=True)

def get_risk_badge(risk_level: str) -> str:
    risk = risk_level.lower().strip()
    if 'high' in risk:
        return f'<span class="risk-badge risk-high">High Risk</span>'
    elif 'medium' in risk:
        return f'<span class="risk-badge risk-medium">Medium Risk</span>'
    else:
        return f'<span class="risk-badge risk-low">Low Risk</span>'

def render_disclaimer():
    st.markdown("---")
    st.markdown('<p style="color: rgba(255,255,255,0.3); font-size: 11px; text-align: center; letter-spacing: 0.5px;">PROPRIETARY AI SYSTEM • FOR DEMONSTRATION ONLY • NOT MEDICAL ADVICE</p>', unsafe_allow_html=True)
