# Erro na Transcrição com Whisper

## Descrição do Erro

Ao testar a função `transcribe_audio`, encontramos o seguinte erro:

```
Erro na transcrição: whisper_init_from_file_with_params_no_state: loading model from 'base'
whisper_init_from_file_with_params_no_state: failed to open 'base'
error: failed to init
```

## Causa do Erro

O erro ocorre quando passamos `'base'` (ou `'tiny'`, `'small'` etc.) como terceiro argumento de `transcribe_audio`. O wrapper cria corretamente o caminho completo para o modelo durante a inicialização, porém esse valor é sobrescrito quando `transcribe_audio` repassa o parâmetro `model` diretamente para o `whisper-cli`. Como o executável espera o caminho completo para o arquivo `.bin`, ao receber apenas `'base'` ele tenta abrir um arquivo inexistente.

## Como Resolver

- **Não sobrescrever o modelo padrão:** se você pretende usar o modelo configurado na inicialização, chame `transcribe_audio` sem o argumento `model`:
  ```python
  transcribe_audio('uploads/20251103_110139_converted.wav', 'pt')
  ```

- **Informar o caminho completo quando quiser escolher um modelo manualmente:** 
  ```python
  transcribe_audio(
      'uploads/20251103_110139_converted.wav',
      'pt',
      'whisper.cpp/models/ggml-base.bin'
  )
  ```

- **Mapear nomes curtos para caminhos antes de chamar o CLI (opcional):** caso deseje manter a possibilidade de passar apenas `'base'`, converta o nome curto para o caminho completo dentro do wrapper antes de repassar para o processo. Por exemplo:
  ```python
  if model and not model.endswith('.bin'):
      model = os.path.join(
          self.project_root, 'whisper.cpp', 'models', f'ggml-{model}.bin'
      )
  ```

## Modelos Disponíveis

Use `WhisperCpp().list_models()` para consultar os modelos `.bin` presentes no diretório `whisper.cpp/models/` e escolher o desejado.
