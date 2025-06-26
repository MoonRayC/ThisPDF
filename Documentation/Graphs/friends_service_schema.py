import graphviz

# Updated colors (optional minor tweaks to highlight service boundary if desired)
colors = {
    'users': '#3c6e71',  # darker tone for external reference
    'relationships': '#f28e2b',
    'requests': '#e15759',
    'blocks': '#76b7b2',
    'activity': '#bab0ac',
    'recommendations': '#59a14f'
}

def make_collection(name, fields, color):
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
            <td align="left"><font color="#666666" face="Courier">{type_}</font></td>
        </tr>'''
        for field, type_ in fields
    )
    
    return f'''<
    <table border="0" cellborder="1" cellspacing="0" cellpadding="4">
        {header}
        {rows}
    </table>>'''

# Initialize graph
dot = graphviz.Digraph(comment='MongoDB Friend Service Schema', format='png',
                       graph_attr={
                           'bgcolor': '#f5f5f5',
                           'fontname': 'Helvetica',
                           'fontsize': '12',
                           'rankdir': 'LR',
                           'splines': 'polyline',
                           'nodesep': '0.6',
                           'ranksep': '0.9'
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

# External users table (from auth_service)
# API to get user details by UUID
# **GET** `/api/devices`
# Requires Authorization: Bearer <access_token> header
# ### Response
# - ✅ `200 OK`
# ```json
# {
#     "id": "user_uuid"
# }
# ```
# - ❌ `401 Unauthorized`
# ```json
# {
#     "error": "Invalid token"
# }
# ```
dot.node('users', make_collection('users (auth_service)', [
    ('id', 'UUID (PK)'),
    ('email', 'string'),
    ('password_hash', 'string'),
    ('created_at', 'datetime'),
    ('updated_at', 'datetime')
], colors['users']))

# Collections (MongoDB)
dot.node('friends', make_collection('friends', [
    ('_id', 'ObjectId'),
    ('user1_id', 'UUID'),
    ('user2_id', 'UUID'),
    ('status', '"pending" | "accepted" | "blocked"'),
    ('action_user_id', 'UUID'),
    ('created_at', 'datetime'),
    ('updated_at', 'datetime')
], colors['relationships']))

dot.node('friend_requests', make_collection('friend_requests', [
    ('_id', 'ObjectId'),
    ('requester_id', 'UUID'),
    ('recipient_id', 'UUID'),
    ('status', '"pending" | "accepted" | "rejected" | "cancelled"'),
    ('message', 'string'),
    ('created_at', 'datetime'),
    ('updated_at', 'datetime')
], colors['requests']))

dot.node('blocked_users', make_collection('blocked_users', [
    ('_id', 'ObjectId'),
    ('blocker_id', 'UUID'),
    ('blocked_id', 'UUID'),
    ('reason', 'string'),
    ('created_at', 'datetime')
], colors['blocks']))

dot.node('friendship_activity', make_collection('friendship_activity', [
    ('_id', 'ObjectId'),
    ('user_id', 'UUID'),
    ('friend_id', 'UUID'),
    ('activity_type', '"request_sent" | "request_accepted" | "request_rejected" | "request_cancelled" | "unfriended" | "blocked" | "unblocked"'),
    ('metadata', 'object'),
    ('created_at', 'datetime')
], colors['activity']))

dot.node('friend_recommendations', make_collection('friend_recommendations', [
    ('_id', 'ObjectId'),
    ('user_id', 'UUID'),
    ('recommended_user_id', 'UUID'),
    ('score', 'decimal'),
    ('reason', 'string'),
    ('created_at', 'datetime'),
    ('updated_at', 'datetime')
], colors['recommendations']))

# Edges (cross-service UUID references from users)
dot.edge('users:id', 'friends:user1_id', label='→ user1_id / user2_id', style='dashed')
dot.edge('users:id', 'friend_requests:requester_id', label='→ requester_id / recipient_id', style='dashed')
dot.edge('users:id', 'blocked_users:blocker_id', label='→ blocker_id / blocked_id', style='dashed')
dot.edge('users:id', 'friendship_activity:user_id', label='→ user_id / friend_id', style='dashed')
dot.edge('users:id', 'friend_recommendations:user_id', label='→ user_id / recommended_user_id', style='dashed')

# Title
dot.attr(label='Friend Microservice Schema (MongoDB)\nwith External User Reference (PostgreSQL)\n\n', labelloc='t', fontsize='16', fontcolor='#333333')

# Render output file
dot.render('friend_microservice_schema_graph', cleanup=True, view=True)
