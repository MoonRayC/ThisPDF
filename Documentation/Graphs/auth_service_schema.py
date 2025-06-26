import graphviz

# Define the color palette
colors = {
    'primary': '#4e79a7',
    'secondary': '#f28e2b',
    'accent': '#e15759',
    'highlight': '#76b7b2',
    'neutral': '#bab0ac',
    'device': '#59a14f'
}

# Define table creation function with indexing and unique constraint indicators
def make_table(name, fields, color):
    header = f'''
    <tr>
        <td bgcolor="{color}" colspan="2">
            <font color="white" point-size="14"><b>{name}</b></font>
        </td>
    </tr>'''
    
    rows = ''.join(
        f'''
        <tr>
            <td align="left" port="{field}">{field}</td>
            <td align="left"><font color="#666666" face="Courier">{type_ or ' '}</font></td>
        </tr>'''
        for field, type_ in fields
    )
    
    return f'''<
    <table border="0" cellborder="1" cellspacing="0" cellpadding="4">
        {header}
        {rows}
    </table>>'''


# Create the graph
dot = graphviz.Digraph(comment='Auth Service Schema', format='png',
                      graph_attr={
                          'bgcolor': '#f5f5f5',
                          'fontname': 'Helvetica',
                          'fontsize': '12',
                          'rankdir': 'TB',
                          'splines': 'ortho',
                          'nodesep': '0.4',
                          'ranksep': '0.8'
                      },
                      node_attr={
                          'shape': 'plaintext',
                          'fontname': 'Helvetica'
                      },
                      edge_attr={
                          'arrowsize': '0.8',
                          'fontname': 'Helvetica',
                          'fontsize': '10',
                          'penwidth': '1.5'
                      })

# Nodes with updated structure
dot.node('users', make_table('users', [
    ('id', 'UUID (PK)'),
    ('email', 'VARCHAR(255) UNIQUE'),
    ('password_hash', 'TEXT'),
    ('is_email_verified', 'BOOLEAN'),
    ('last_login_at', 'TIMESTAMP'),
    ('created_at', 'TIMESTAMP'),
    ('updated_at', 'TIMESTAMP'),
    ('deleted_at', 'TIMESTAMP (nullable)')
], colors['primary']))

dot.node('social_accounts', make_table('social_accounts', [
    ('id', 'UUID (PK)'),
    ('user_id', 'UUID (IDX)'),
    ('provider', 'VARCHAR(50)'),
    ('provider_uid', 'TEXT UNIQUE'),
    ('email', 'VARCHAR(255)'),
    ('created_at', 'TIMESTAMP')
], colors['secondary']))

dot.node('password_resets', make_table('password_resets', [
    ('id', 'UUID (PK)'),
    ('user_id', 'UUID (IDX)'),
    ('reset_token', 'TEXT UNIQUE'),
    ('expires_at', 'TIMESTAMP'),
    ('used', 'BOOLEAN'),
    ('created_at', 'TIMESTAMP')
], colors['accent']))

dot.node('email_verification_tokens', make_table('email_verification_tokens', [
    ('id', 'UUID (PK)'),
    ('user_id', 'UUID (IDX)'),
    ('verification_token', 'TEXT UNIQUE'),
    ('expires_at', 'TIMESTAMP'),
    ('used', 'BOOLEAN'),
    ('created_at', 'TIMESTAMP')
], colors['highlight']))

dot.node('refresh_tokens', make_table('refresh_tokens', [
    ('id', 'UUID (PK)'),
    ('user_id', 'UUID (IDX)'),
    ('token', 'TEXT UNIQUE'),
    ('user_agent', 'TEXT'),
    ('ip_address', 'INET'),
    ('expires_at', 'TIMESTAMP'),
    ('revoked', 'BOOLEAN'),
    ('created_at', 'TIMESTAMP')
], colors['neutral']))

dot.node('devices', make_table('devices', [
    ('id', 'UUID (PK)'),
    ('user_id', 'UUID (IDX)'),
    ('device_id', 'TEXT UNIQUE'),
    ('user_agent', 'TEXT'),
    ('last_seen_at', 'TIMESTAMP'),
    ('created_at', 'TIMESTAMP')
], colors['device']))

# Edges
dot.edge('users:id', 'social_accounts:user_id', label='1 → N', color='#666666', fontcolor='#333333', style='bold')
dot.edge('users:id', 'password_resets:user_id', label='1 → N', color='#666666', fontcolor='#333333', style='bold')
dot.edge('users:id', 'email_verification_tokens:user_id', label='1 → N', color='#666666', fontcolor='#333333', style='bold')
dot.edge('users:id', 'refresh_tokens:user_id', label='1 → N', color='#666666', fontcolor='#333333', style='bold')
dot.edge('users:id', 'devices:user_id', label='1 → N', color='#666666', fontcolor='#333333', style='bold')

# Title
dot.attr(label='User Authentication Database Schema\n\n', labelloc='t', fontsize='16', fontcolor='#333333')

# Render
dot.render('auth_service_schema_graph', cleanup=True, view=False)
