import { describe, it } from 'node:test'
import { defTexts } from '../lib/index.js'

// https://loremipsum.io/generator?n=15&t=p
const lorem_ipsum_15_paragraphs = `Lorem ipsum odor amet, consectetuer adipiscing elit. Turpis est lorem tempor ac congue, scelerisque condimentum potenti. Efficitur euismod quis rutrum ipsum fermentum euismod. Posuere risus dapibus mi donec aliquet aenean ultrices. Felis nisl eleifend mollis, sem lacus odio. Praesent dis lorem condimentum netus finibus ut. Senectus ipsum tempus himenaeos enim curae. Turpis purus fusce, justo ullamcorper porta cursus. Phasellus himenaeos morbi nec proin tempus inceptos tincidunt conubia?

Odio quisque erat phasellus placerat mollis tempor. Urna sociosqu dictum montes lacus euismod libero at ullamcorper interdum. Pretium vestibulum facilisis libero per ante sed. Porta torquent taciti cursus lectus posuere, consequat ad sapien. Lacus sodales porta, scelerisque ridiculus ad nullam. Nibh augue at dis eros urna ornare litora. Duis rutrum nostra habitasse auctor elit nam eget. Finibus habitasse natoque laoreet donec dapibus. Aenean sodales egestas quisque sed neque magna.

Enim natoque metus sem metus felis aliquet elementum? Fringilla placerat maecenas montes per, netus mattis torquent neque malesuada. Habitasse taciti mus risus cursus, suspendisse parturient tortor porta. Cursus tristique dolor porttitor turpis erat vulputate augue. Cursus massa sagittis nascetur mauris habitant sodales egestas cras eu. Elit ornare ad tincidunt senectus aenean mi. Leo non consequat magna, nisl suscipit class facilisi velit. Senectus cubilia senectus orci venenatis rutrum ridiculus tortor.

Nascetur taciti tincidunt elementum, consectetur taciti fames laoreet facilisi. Habitant auctor sem volutpat litora torquent leo nullam vel. Vel lobortis facilisi efficitur varius lectus faucibus. Feugiat interdum quam a auctor ante curae dui volutpat luctus. Id dignissim litora ridiculus eu accumsan metus torquent sociosqu. Commodo a justo mattis nunc neque nibh ipsum. Nibh varius non natoque mollis aliquam et. Aptent elementum sollicitudin lectus dis lectus justo. Lorem maecenas potenti rutrum eu habitant torquent faucibus laoreet.

Torquent lacinia ac consequat ultrices posuere quisque praesent erat. Malesuada himenaeos viverra sem, natoque porttitor dui libero. Ut ridiculus magnis vitae maximus blandit suspendisse eleifend. Proin posuere nunc mus scelerisque nostra phasellus lorem. Elementum adipiscing massa non ullamcorper purus ultrices amet. Magna torquent praesent sem amet laoreet ipsum viverra. Penatibus cursus purus nullam vestibulum curabitur natoque sociosqu fringilla. Fringilla elementum imperdiet gravida lorem hac enim et id. Placerat vel at tortor turpis fames. Amet libero sociosqu suspendisse interdum accumsan elit himenaeos ut?

Suspendisse fames urna torquent est vulputate aliquet interdum venenatis. Orci elit consequat aenean non lectus potenti. Cras placerat accumsan fringilla tellus nunc per. Congue gravida vitae non nec eget nulla at. Potenti sed cursus egestas luctus commodo vehicula fames. Metus urna aliquam, dictum amet consectetur porta lobortis nisi. Natoque aptent fusce tempor quisque lobortis. Ligula ut facilisi finibus ut, scelerisque a. Potenti venenatis potenti finibus, porta varius libero.

Ac varius cras arcu mauris nascetur interdum per. Nullam magna cras sapien parturient magnis curabitur nisi leo. Torquent faucibus ligula tempus bibendum egestas felis finibus. Nibh tristique sagittis dui sapien vestibulum metus platea nisi. Vehicula viverra ullamcorper suscipit placerat vestibulum ornare augue ridiculus habitasse. Semper proin ligula aliquam phasellus cras.

Tincidunt eu potenti orci faucibus ultrices suspendisse. Sed varius nisi, tortor adipiscing suscipit curabitur gravida. Pharetra blandit porttitor duis velit velit duis; dolor sodales placerat. Consectetur dolor orci consectetur massa ante eget tempor nunc natoque. Ex gravida massa aliquet rutrum fermentum. Dignissim dolor porttitor sociosqu iaculis senectus elit eros.

Nisi elit tempus at, sociosqu morbi nostra. Elit parturient nullam nunc fermentum; laoreet porta facilisis vivamus. Natoque ridiculus sed suscipit himenaeos conubia pellentesque quam. Fames maximus potenti ligula facilisis, dolor nascetur. Torquent aliquet eros pellentesque pharetra class eu curae mi? Efficitur arcu congue nulla gravida quisque facilisi. Ante urna rhoncus aliquet consectetur ut sed orci fames. Blandit imperdiet metus pretium malesuada vulputate orci, ullamcorper cras condimentum. Eget tincidunt fermentum netus orci eros natoque per. Massa eleifend torquent nascetur volutpat est pharetra himenaeos litora porttitor.

Viverra magna pharetra maximus nam mollis luctus id. Class odio consectetur vestibulum himenaeos ex convallis cubilia facilisis sit. Sit lectus euismod mollis morbi proin. Eget leo habitasse vulputate cubilia risus tempor orci. Eget posuere pellentesque consectetur natoque sodales curabitur convallis aliquet. Natoque fermentum praesent faucibus facilisis praesent varius mollis. Ac nisi facilisis pretium ac fermentum amet habitant nisl purus. Praesent quis luctus nisi sit torquent. Parturient aptent venenatis placerat velit mattis rutrum tristique malesuada. Senectus cubilia lectus cras eget habitasse, leo dapibus gravida.

Parturient nunc gravida id at amet cras. Curae etiam quis ex sapien vehicula nam lobortis bibendum aptent. Leo facilisis hac aliquam platea eget lorem. Euismod nulla class tellus sapien potenti venenatis senectus pellentesque. Ante facilisi integer eget praesent in est. Ligula eget ullamcorper id convallis congue ante. Est curae himenaeos commodo nullam eros class eros. Semper mauris sollicitudin auctor magnis tellus duis litora nullam. Finibus fames nam aptent; feugiat pretium vel.

Interdum semper ante; molestie proin netus nulla cursus. Dis justo quam molestie quisque parturient feugiat ornare. Sodales nisl scelerisque odio urna torquent. Efficitur ullamcorper venenatis maecenas cubilia potenti. Ligula turpis accumsan gravida magnis libero dictum ullamcorper. Placerat mollis curae fusce massa lorem in. Litora dui torquent magna in efficitur fringilla consequat tellus orci.

Litora urna montes gravida fringilla nisi lectus magna ante. Velit nulla enim varius sed scelerisque vel conubia sed. Nisl platea varius aenean quis commodo. Egestas accumsan pretium nullam risus cursus neque euismod. Tempor vulputate efficitur pharetra malesuada magna lacus ornare et? Consequat proin vivamus finibus inceptos enim primis. Finibus blandit nulla cursus ex non facilisi torquent ridiculus accumsan. Tellus dictumst consectetur eleifend semper mauris vivamus torquent orci.

Cursus phasellus aptent natoque nisl, ligula commodo vehicula cubilia. Est habitasse augue tempor malesuada sed mauris. Amet nullam bibendum feugiat dui cubilia velit sociosqu ullamcorper. Nullam taciti accumsan ante urna tincidunt penatibus vestibulum auctor. Sodales nulla dui et magnis platea arcu leo. Id augue erat ipsum enim tempor inceptos felis. Lacus velit fermentum neque hendrerit; malesuada pretium risus. Per magna inceptos habitant faucibus ex a nibh. Accumsan ex elementum aptent litora habitant!

Dapibus interdum nunc suspendisse augue dolor sagittis. Phasellus adipiscing magna finibus habitasse orci viverra. Potenti varius duis mi scelerisque non suspendisse porttitor neque finibus. Massa tristique vestibulum cras fermentum amet aptent. Ac conubia cursus sodales sociosqu dui pellentesque erat. Etiam ligula neque pretium nam molestie malesuada fusce. Suspendisse fringilla quam; ac tempus adipiscing nisi. Ornare cras sodales pretium faucibus fermentum dis ligula. Neque urna suscipit convallis quis, nunc congue lorem etiam.`

describe('defTexts', () => {
  describe('each generated text', () => {
    it('contains the canonical URL we syndicated from (shorter content)', (t) => {
      const canonicalUrl = 'https://example.com/'
      const textThreshold = 6

      const texts = defTexts({
        canonicalUrl,
        jf2: { type: 'entry', content: 'Hello world' },
        textThreshold
      })

      texts.forEach((text) => {
        t.assert.ok(text.includes(canonicalUrl))
      })
    })

    it('contains the canonical URL we syndicated from (longer content with textThreshold=2000)', (t) => {
      const canonicalUrl = 'https://example.com/'
      const textThreshold = 2000

      const texts = defTexts({
        canonicalUrl,
        jf2: { type: 'entry', content: lorem_ipsum_15_paragraphs },
        textThreshold
      })

      texts.forEach((text) => {
        t.assert.ok(text.includes(canonicalUrl))
        // t.assert.ok(text.length <= textThreshold)
        // t.assert.ok(text.length >= textThreshold)
      })
    })
  })
})
