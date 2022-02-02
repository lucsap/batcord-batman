import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { ButtonSendSticker } from "../src/components/ButtonSendSticker";
import React from "react";
import appConfig from "../config.json";

// Commo fazer AJAX: https://medium.com/@omariosouto/entendendo-como-fazer-ajax-com-a-fetchapi-977ff20da3c6
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0Mzc3NzE4MiwiZXhwIjoxOTU5MzUzMTgyfQ.Nb1pFZD2xxMZKEZsIhG60U9ndmk00wMAhgsotKRwM_4";
const SUPABASE_URL = "https://exhnwsmgojkwehbtpzey.supabase.co";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem) {
  return supabaseClient
    .from("mensagens")
    .on("INSERT", (respostaLive) => {
      adicionaMensagem(respostaLive.new);
    })
    .subscribe();
}

export default function ChatPage() {
  /*
  // Usuário
  - Usuário digita no campo textarea
  - Aperta enter pra enviar
  - Tem que adicionar o texto na listagem

  // Dev
    - [x] Campo criado
    - [x] Vamos usar o onChange usa o UseState (ter if pra caso seja enter pra limpar a variável)
    - [x] Lista de mensagens
    */

   const roteamento = useRouter();
   const [mensagem, setMensagem] = React.useState("");
   const [listaMensagem, setListaMensagem] = React.useState([]);
   const usuarioLogado = roteamento.query.username;
   // console.log('Roteamento.Query', roteamento.query)

  React.useEffect(() => {
    supabaseClient
      .from("mensagens")
      .select("*")
      .then(({ data }) => {
        // console.log("Dados da consulta: ", data);
        setListaMensagem(data);
      });

    const subscription = escutaMensagensEmTempoReal((novaMensagem) => {
      console.log("Nova mensagem:", novaMensagem);
      setListaMensagem((valorAtualDaLista) => {
        console.log('valorAtualDaLista: ', valorAtualDaLista);
        return [
          ...valorAtualDaLista,
          novaMensagem,
        ]
      });
    });

    return () => {
      subscription.unsubscribe();
    }
  }, []);

  function handleNovaMensagem(novaMensagem) {
    const mensagem = {
      // id: listaMensagem.length + 1,
      de: usuarioLogado,
      texto: novaMensagem,
    };

    supabaseClient
      .from("mensagens")
      .insert([
        // Tem que ser um objeto com os MESMOS CAMPOS que você escreveu no supabase
        mensagem,
      ])
      .then(({ data }) => {
        console.log("Criando mensagem: ", data);
      });

    // Chamada de um backend
    setMensagem("");
  }

  return (
    <Box
      styleSheet={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://www.pixelstalk.net/wp-content/uploads/2016/05/Batman-HD-Wallpapers-for-Desktop.png)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        color: appConfig.theme.colors.neutrals["000"],
      }}
    >
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: "90%",
          maxWidth: "90%",
          maxHeight: "95vh",
          padding: "32px",
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: "column",
            borderRadius: "5px",
            padding: "16px",
          }}
        >
          {/* Ta mudando o valor: {mensagem} */}
          {/* <MessageList mensagens={[]} /> */}
          <MessageList mensagens={listaMensagem} />
          {/* {listaMensagem.map((mensagemAtual) => {
              return (
                  <li key={mensagemAtual.id}>
                      {mensagem.de}: {mensagem.texto}
                  </li>
              )
          })} */}

          <Box
            as="form"
            styleSheet={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              value={mensagem}
              onChange={(event) => {
                // console.log(event);
                const valor = event.target.value;
                setMensagem(valor);
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleNovaMensagem(mensagem);
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: "100%",
                border: "0",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: "12px",
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            {/* Callback */}
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                // console.log("[USANDO O COMPONENTE] Salva esse sticker no banco", sticker);
                handleNovaMensagem(":sticker: " + sticker);
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Header() {
  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="heading5">Chat</Text>
        <Button
          variant="tertiary"
          colorVariant="neutral"
          label="Logout"
          href="/"
        />
      </Box>
    </>
  );
}

function MessageList(props) {
  //   console.log("MessageList", props);
  // console.log(props.listaMensagem);
  return (
    <Box
      tag="ul"
      styleSheet={{
        overflow: "scroll",
        display: "flex-wrap",
        flexDirection: "column-reverse",
        flex: 1,
        color: appConfig.theme.colors.neutrals["000"],
        marginBottom: "16px",
      }}
    >
      {props.mensagens.map((mensagem) => {
        return (
          <Text
            key={mensagem.id}
            tag="li"
            styleSheet={{
              borderRadius: "5px",
              padding: "6px",
              marginBottom: "12px",
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              },
            }}
          >
            <Box
              styleSheet={{
                marginBottom: "8px",
              }}
            >
              <Image
                styleSheet={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "8px",
                }}
                src={`https://github.com/${mensagem.de}.png`}
              />
              <Text tag="strong">{mensagem.de}</Text>
              <Text
                styleSheet={{
                  fontSize: "10px",
                  marginLeft: "8px",
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag="span"
              >
                {new Date().toLocaleDateString()}
              </Text>
            </Box>
            {/* Condicional: {mensagem.texto.startsWith(":sticker:").toString()} */}
            {mensagem.texto.startsWith(":sticker:") ? (
              <Image src={mensagem.texto.replace(":sticker:", "")} />
            ) : (
              mensagem.texto
            )}
            {/* if mensagem de texto possui stickers:
              mostra a imagem
            else
              mensagem.texto */}
            {/* {mensagem.texto} */}
          </Text>
        );
      })}
    </Box>
  );
}
