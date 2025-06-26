from graphviz import Digraph

dot = Digraph('AuthUserProfileArchitecture', filename='auth_profile_architecture', format='png')
dot.attr(rankdir='LR', fontsize='12')

# Define nodes using HTML-style tables
dot.node('auth_service', label= r'''<
<table border="1" cellborder="0" cellspacing="0" cellpadding="6">
  <tr><td bgcolor="#4e79a7" colspan="2"><font color="white"><b>auth_service</b></font></td></tr>
  <tr><td align="left"><b>Table:</b></td><td align="left">users</td></tr>
  <tr><td align="left">id</td><td align="left">UUID (PK)</td></tr>
  <tr><td align="left">email</td><td align="left">VARCHAR</td></tr>
  <tr><td align="left">password_hash</td><td align="left">TEXT</td></tr>
  <tr><td align="left">is_email_verified</td><td align="left">BOOLEAN</td></tr>
  <tr><td align="left">created_at</td><td align="left">TIMESTAMPTZ</td></tr>
</table>
>''')

dot.node('user_profile_service', label= r'''<
<table border="1" cellborder="0" cellspacing="0" cellpadding="6">
  <tr><td bgcolor="#f28e2b" colspan="2"><font color="white"><b>user_profile_service</b></font></td></tr>
  <tr><td align="left"><b>Table:</b></td><td align="left">user_profiles</td></tr>
  <tr><td align="left">id</td><td align="left">UUID (FK to auth.users.id)</td></tr>
  <tr><td align="left">username</td><td align="left">VARCHAR(50)</td></tr>
  <tr><td align="left">avatar_url</td><td align="left">TEXT</td></tr>
  <tr><td align="left">bio</td><td align="left">TEXT</td></tr>
  <tr><td align="left">last_active_at</td><td align="left">TIMESTAMPTZ</td></tr>
</table>
>''')

# Services
dot.node('frontend', shape='ellipse', style='filled', fillcolor='#a0cbe8', label='Frontend\n(React/Vue/Flutter)')
dot.node('gateway', shape='box', style='filled', fillcolor='#bab0ab', label='API Gateway\n(NGINX/Express)')
dot.node('auth_api', shape='box', style='filled', fillcolor='#59a14f', label='auth_service\n(API)')
dot.node('profile_api', shape='box', style='filled', fillcolor='#edc948', label='user_profile_service\n(API)')

# Arrows and relationships
dot.edge('frontend', 'gateway', label='HTTP Request')
dot.edge('gateway', 'auth_api', label='Auth endpoints\n/login, /register')
dot.edge('gateway', 'profile_api', label='Profile endpoints\nGET/POST /profile')

# Inter-service call
dot.edge('profile_api', 'auth_api', label='Verify JWT\n(user lookup)', style='dashed')

# DB links
dot.edge('auth_api', 'auth_service', label='PostgreSQL')
dot.edge('profile_api', 'user_profile_service', label='PostgreSQL')

# Auth ID linking
dot.edge('auth_service', 'user_profile_service', label='Shared UUID', style='dotted', constraint='false')

# Render
dot.render()
print("✅ Diagram rendered as auth_profile_architecture.png")
