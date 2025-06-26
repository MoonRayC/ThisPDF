import graphviz

# Create a new directed graph with professional styling
dot = graphviz.Digraph('ThisPDF Microservice Architecture', format='png',
                      graph_attr={
                          'bgcolor': '#f8f9fa',
                          'fontname': 'Helvetica',
                          'fontsize': '12',
                          'rankdir': 'TB',
                          'splines': 'ortho',
                          'nodesep': '0.6',
                          'ranksep': '1.0',
                          'compound': 'true'
                      },
                      node_attr={
                          'fontname': 'Helvetica',
                          'shape': 'box',
                          'style': 'rounded,filled',
                          'fillcolor': '#ffffff',
                          'color': '#333333',
                          'penwidth': '1.5'
                      },
                      edge_attr={
                          'arrowsize': '0.8',
                          'fontname': 'Helvetica',
                          'fontsize': '10',
                          'penwidth': '1.2',
                          'color': '#6c757d'
                      })

# Color palette
colors = {
    'auth': '#4e79a7',
    'user': '#f28e2b',
    'upload': '#e15759',
    'storage': '#59a14f',
    'viewer': '#edc948',
    'search': '#af7aa1',
    'comments': '#ff9da7',
    'analytics': '#9c755f',
    'notification': '#bab0ac',
    'chat': '#76b7b2',
    'friend': '#b07aa1',
    'gateway': '#ffbb78'
}

# Cluster for Microservices
with dot.subgraph(name='cluster_microservices') as c:
    c.attr(label='Microservices', style='filled', fillcolor='#e9ecef', color='#adb5bd', fontsize='14')
    
    # Add microservice nodes
    c.node('auth', 'Auth Service\n(User auth, JWT)', shape='box3d', fillcolor=colors['auth'], fontcolor='white')
    c.node('user', 'User Profile Service', shape='box3d', fillcolor=colors['user'], fontcolor='white')
    c.node('upload', 'Upload Service\n(PDF processing)', shape='box3d', fillcolor=colors['upload'], fontcolor='white')
    c.node('storage', 'Storage Service\n(MinIO)', shape='box3d', fillcolor=colors['storage'], fontcolor='white')
    c.node('viewer', 'Viewer Service\n(PDF.js)', shape='box3d', fillcolor=colors['viewer'])
    c.node('search', 'Search Service\n(Meilisearch)', shape='box3d', fillcolor=colors['search'], fontcolor='white')
    c.node('comments', 'Comments Service', shape='box3d', fillcolor=colors['comments'])
    c.node('analytics', 'Analytics Service\n(Kafka+ClickHouse)', shape='box3d', fillcolor=colors['analytics'], fontcolor='white')
    c.node('notification', 'Notification Service', shape='box3d', fillcolor=colors['notification'])
    c.node('chat', 'Global Chat Service\n(Socket.IO)', shape='box3d', fillcolor=colors['chat'])
    c.node('friend', 'Friend Service', shape='box3d', fillcolor=colors['friend'], fontcolor='white')
    c.node('gateway', 'API Gateway\n(NGINX)', shape='box3d', fillcolor=colors['gateway'])

# Cluster for Databases
with dot.subgraph(name='cluster_databases') as c:
    c.attr(label='Databases', style='filled', fillcolor='#e9ecef', color='#adb5bd', fontsize='14')
    c.node('postgres', 'PostgreSQL\n(User data)', shape='cylinder', fillcolor='#336791', fontcolor='white')
    c.node('mongo', 'MongoDB\n(Comments, Chat)', shape='cylinder', fillcolor='#589636', fontcolor='white')
    c.node('meili', 'Meilisearch\n(Search index)', shape='cylinder', fillcolor='#ff5a5f', fontcolor='white')
    c.node('clickhouse', 'ClickHouse\n(Analytics)', shape='cylinder', fillcolor='#ffcc00')
    c.node('redis', 'Redis\n(Cache, Pub/Sub)', shape='cylinder', fillcolor='#d82c20', fontcolor='white')
    c.node('minio', 'MinIO\n(PDF Storage)', shape='cylinder', fillcolor='#28a745', fontcolor='white')

# Cluster for Frontend
with dot.subgraph(name='cluster_frontend') as c:
    c.attr(label='Frontend', style='filled', fillcolor='#e9ecef', color='#adb5bd', fontsize='14')
    c.node('react', 'React.js\nWeb Application', shape='folder', fillcolor='#61dafb')
    c.node('admin', 'Admin Panel\n(AdminJS)', shape='folder', fillcolor='#ff2d20', fontcolor='white')
    c.node('pdfjs', 'PDF.js\n(Viewer)', shape='component', fillcolor='#8b0000', fontcolor='white')

# Define relationships between services
dot.edge('gateway', 'auth', label=' auth ')
dot.edge('gateway', 'user')
dot.edge('gateway', 'upload', label=' upload ')
dot.edge('gateway', 'viewer')
dot.edge('gateway', 'search')
dot.edge('gateway', 'comments')
dot.edge('gateway', 'chat')
dot.edge('gateway', 'friend')

# Database connections
dot.edge('auth', 'postgres', style='dashed')
dot.edge('user', 'postgres', style='dashed')
dot.edge('upload', 'minio', style='dashed')
dot.edge('storage', 'minio', style='dashed')
dot.edge('comments', 'mongo', style='dashed')
dot.edge('chat', 'mongo', style='dashed')
dot.edge('chat', 'redis', style='dashed')
dot.edge('friend', 'mongo', style='dashed')
dot.edge('search', 'meili', style='dashed')
dot.edge('analytics', 'clickhouse', style='dashed')
dot.edge('notification', 'redis', style='dashed')

# Frontend connections
dot.edge('react', 'gateway', dir='both', label=' API ')
dot.edge('react', 'pdfjs', dir='both')
dot.edge('admin', 'gateway', dir='both')

# Add title and legend
dot.attr(label='ThisPDF.com - PDF Sharing Platform Architecture\n\n',
         labelloc='t',
         fontsize='18',
         fontcolor='#2c3e50')

# Render the graph
dot.render('thispdf_microservice_architecture', cleanup=True, view=True)