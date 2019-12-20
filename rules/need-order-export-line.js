module.exports = {
    meta: {
        docs: {},
        fixable: 'code',
        schema: []
    },
    create(context) {
        function checkSortLine(node) {
            var prev = '';
            for (var i = 0; i < node.specifiers.length; i++) {
                if (prev && prev > node.specifiers[i].exported.name) {
                    context.report({
                        node,
                        message: 'Exported variables are not in sequential order',
                        fix: function(fixer) { return fixSortLine(fixer, node) }
                    });
                }
                prev = node.specifiers[i].exported.name;
            }
        }

        function fixSortLine(fixer, node) {
            var range = [
                node.specifiers[0].start,
                node.specifiers[node.specifiers.length - 1].end
            ];

            var sep = node.loc.start.line !== node.loc.end.line ? ', \n\t' : ', ';
            node = node.specifiers.map(function(item) {
                return item.exported.name
            });
            node = node.sort(function(a, b) {
                return b > a ? -1 : 1;
            });

            return fixer.replaceTextRange(range, node.join(sep));
        }

        return {
            Program(node) {
                for (var i = 0; i < node.body.length; i++) {
                    if (node.body[i].type === 'ExportNamedDeclaration') {
                        checkSortLine(node.body[i]);
                        break;
                    }
                }
            }
        }
    }
};
