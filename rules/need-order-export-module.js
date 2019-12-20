module.exports = {
    meta: {
        docs: {},
        fixable: 'code',
        schema: []
    },
    create(context) {
        function fixSorExports(fixer, nodes) {
            var range = [nodes[0].start, nodes[nodes.length - 1].end];
            var sourceCode = context.getSourceCode();
            nodes = nodes.sort(function(a, b) {
                if (getModuleName(b) > getModuleName(a)) return -1;
                else return 1;
            });

            var res = [];
            for (var i = 0; i < nodes.length; i++) {
                res.push(sourceCode.getText(nodes[i]));
            }
            return fixer.replaceTextRange(range, res.join('\n'));
        }

        function getModuleName(node) {
            if (node.declaration) {
                return node.declaration.declarations[0].id.name;
            } else {
                return node.source.value.split('/').pop().replace("'", "");
            }
        }

        return {
            Program(node) {
                var exportsNodes = [];
                for (var i = 0; i < node.body.length; i++) {
                    if (node.body[i].type === 'ExportNamedDeclaration') {
                        exportsNodes.push(node.body[i]);
                    }
                }

                var prev = '';
                for (var i = 0; i < exportsNodes.length; i++) {
                    var module = getModuleName(exportsNodes[i]);
                    if (prev && prev > module) {
                        context.report({
                            node: exportsNodes[i],
                            message: 'The modules are out of order',
                            fix: function(fixer) { return fixSorExports(fixer, exportsNodes) }
                        });
                        break;
                    }
                    prev = module;
                }
            }
        }
    }
};