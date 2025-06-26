import graphviz

# Create the diagram
dot = graphviz.Digraph('User Profile Service Schema', format='png',
                      graph_attr={
                          'bgcolor': '#f8f9fa',
                          'fontname': 'Helvetica',
                          'fontsize': '12',
                          'rankdir': 'TB'
                      },
                      node_attr={
                          'fontname': 'Helvetica',
                          'shape': 'plaintext'
                      })

# Function to create HTML-style table
def make_profile_table():
    return '''<
    <table border="1" cellborder="0" cellspacing="0" cellpadding="4">
        <tr><td bgcolor="#f28e2b" colspan="2"><font color="white"><b>user_profiles</b></font></td></tr>
        <tr><td align="left" port="id">id</td><td align="left">UUID (FK to auth.users)</td></tr>
        <tr><td align="left">username</td><td align="left">VARCHAR(50)</td></tr>
        <tr><td align="left">avatar_url</td><td align="left">TEXT</td></tr>
        <tr><td align="left">bio</td><td align="left">TEXT</td></tr>
        <tr><td align="left">created_at</td><td align="left">TIMESTAMPTZ</td></tr>
        <tr><td align="left">updated_at</td><td align="left">TIMESTAMPTZ</td></tr>
        <tr><td align="left">last_active_at</td><td align="left">TIMESTAMPTZ</td></tr>
    </table>>'''

# Add the profile table
dot.node('profile_table', make_profile_table())

# Add the auth table for reference
dot.node('auth_table', '''<
    <table border="1" cellborder="0" cellspacing="0" cellpadding="4">
        <tr><td bgcolor="#4e79a7" colspan="2"><font color="white"><b>auth.users</b></font></td></tr>
        <tr><td align="left">id</td><td align="left">UUID</td></tr>
        <tr><td align="left">email</td><td align="left">VARCHAR(255)</td></tr>
        <tr><td align="left">password_hash</td><td align="left">TEXT</td></tr>
        <tr><td align="left">is_verified</td><td align="left">BOOLEAN</td></tr>
    </table>>''')

# Show the relationship
dot.edge('auth_table:id', 'profile_table:id', 
         label=' 1:1 ', 
         style='dashed',
         color='#666666',
         fontcolor='#333333')

# Add title and legend
dot.attr(label='''<<table border="0" cellspacing="0">
    <tr><td><font point-size="18"><b>User Profile Service Schema</b></font></td></tr>
    <tr><td><font point-size="12">(Separate from Auth Service)</font></td></tr>
</table>>''',
         labelloc='t')

# Add color legend
dot.node('legend', '''<<table border="0" cellspacing="0">
    <tr><td bgcolor="#f28e2b" width="20" height="20"></td><td>Profile Data</td></tr>
    <tr><td bgcolor="#4e79a7" width="20" height="20"></td><td>Auth Data</td></tr>
</table>>''', shape='plaintext')

# Render
dot.render('user_profile_schema_graph', cleanup=True, view=True)